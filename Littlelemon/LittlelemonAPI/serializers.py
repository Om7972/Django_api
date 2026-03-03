from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Category, MenuItem, Cart, Order, OrderItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'slug', 'title']

class MenuItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = MenuItem
        fields = ['id', 'title', 'price', 'featured', 'category', 'category_id']

class CartSerializer(serializers.ModelSerializer):
    menuitem = MenuItemSerializer(read_only=True)
    menuitem_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'menuitem', 'menuitem_id', 'quantity', 'unit_price', 'price']
        read_only_fields = ['unit_price', 'price']

class OrderItemSerializer(serializers.ModelSerializer):
    menuitem = MenuItemSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menuitem', 'quantity', 'unit_price', 'price']

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True, source='orderitem_set')
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'delivery_crew', 'status', 'total', 'date', 'order_items']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'groups']