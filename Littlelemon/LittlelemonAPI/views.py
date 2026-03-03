from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User, Group
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Category, MenuItem, Cart, Order, OrderItem
from .serializers import (
    CategorySerializer, MenuItemSerializer, CartSerializer, 
    OrderSerializer, OrderItemSerializer, UserSerializer
)
from .permissions import IsManager, IsDeliveryCrew, IsCustomer

# Category Views
class CategoriesView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsManager()]

# Menu Item Views
class MenuItemsView(generics.ListCreateAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    ordering_fields = ['price', 'title']
    filterset_fields = ['category', 'featured']
    search_fields = ['title']
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsManager()]

class SingleMenuItemView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated, IsManager]

# Manager Group Management
class ManagerGroupView(generics.ListCreateAPIView):
    queryset = User.objects.filter(groups__name='Manager')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsManager]
    
    def post(self, request):
        username = request.data.get('username')
        if username:
            user = get_object_or_404(User, username=username)
            managers = Group.objects.get(name='Manager')
            managers.user_set.add(user)
            return Response({'message': 'User added to manager group'}, status=status.HTTP_201_CREATED)
        return Response({'error': 'Username required'}, status=status.HTTP_400_BAD_REQUEST)

class RemoveManagerView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsManager]
    
    def delete(self, request, userId):
        user = get_object_or_404(User, id=userId)
        managers = Group.objects.get(name='Manager')
        managers.user_set.remove(user)
        return Response({'message': 'User removed from manager group'}, status=status.HTTP_200_OK)

# Delivery Crew Management
class DeliveryCrewView(generics.ListCreateAPIView):
    queryset = User.objects.filter(groups__name='Delivery crew')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsManager]
    
    def post(self, request):
        username = request.data.get('username')
        if username:
            user = get_object_or_404(User, username=username)
            delivery_crew = Group.objects.get(name='Delivery crew')
            delivery_crew.user_set.add(user)
            return Response({'message': 'User added to delivery crew'}, status=status.HTTP_201_CREATED)
        return Response({'error': 'Username required'}, status=status.HTTP_400_BAD_REQUEST)

class RemoveDeliveryCrewView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsManager]
    
    def delete(self, request, userId):
        user = get_object_or_404(User, id=userId)
        delivery_crew = Group.objects.get(name='Delivery crew')
        delivery_crew.user_set.remove(user)
        return Response({'message': 'User removed from delivery crew'}, status=status.HTTP_200_OK)

# Cart Management
class CartView(generics.ListCreateAPIView, generics.DestroyAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def post(self, request):
        menuitem_id = request.data.get('menuitem_id')
        quantity = request.data.get('quantity', 1)
        
        menuitem = get_object_or_404(MenuItem, id=menuitem_id)
        
        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            menuitem=menuitem,
            defaults={
                'quantity': quantity,
                'unit_price': menuitem.price,
                'price': menuitem.price * int(quantity)
            }
        )
        
        if not created:
            cart_item.quantity += int(quantity)
            cart_item.price = cart_item.unit_price * cart_item.quantity
            cart_item.save()
        
        serializer = CartSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def delete(self, request):
        Cart.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)

# Order Management
class OrdersView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='Manager').exists():
            return Order.objects.all()
        elif user.groups.filter(name='Delivery crew').exists():
            return Order.objects.filter(delivery_crew=user)
        else:
            return Order.objects.filter(user=user)
    
    def post(self, request):
        # Create order from cart
        cart_items = Cart.objects.filter(user=request.user)
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        total = sum(item.price for item in cart_items)
        order = Order.objects.create(user=request.user, total=total)
        
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                menuitem=cart_item.menuitem,
                quantity=cart_item.quantity,
                unit_price=cart_item.unit_price,
                price=cart_item.price
            )
        
        # Clear cart
        cart_items.delete()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SingleOrderView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='Manager').exists():
            return Order.objects.all()
        elif user.groups.filter(name='Delivery crew').exists():
            return Order.objects.filter(delivery_crew=user)
        else:
            return Order.objects.filter(user=user)
    
    def patch(self, request, pk):
        order = get_object_or_404(Order, id=pk)
        
        if request.user.groups.filter(name='Delivery crew').exists():
            # Delivery crew can only update status
            order.status = request.data.get('status', order.status)
            order.save()
        elif request.user.groups.filter(name='Manager').exists():
            # Manager can update delivery crew and status
            delivery_crew_id = request.data.get('delivery_crew')
            if delivery_crew_id:
                delivery_crew = get_object_or_404(User, id=delivery_crew_id)
                order.delivery_crew = delivery_crew
            
            status_value = request.data.get('status')
            if status_value is not None:
                order.status = status_value
            
            order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)