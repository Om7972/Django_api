from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories', views.CategoriesView.as_view()),
    
    # Menu Items
    path('menu-items', views.MenuItemsView.as_view()),
    path('menu-items/<int:pk>', views.SingleMenuItemView.as_view()),
    
    # Manager endpoints
    path('groups/manager/users', views.ManagerGroupView.as_view()),
    path('groups/manager/users/<int:userId>', views.RemoveManagerView.as_view()),
    
    # Delivery crew endpoints
    path('groups/delivery-crew/users', views.DeliveryCrewView.as_view()),
    path('groups/delivery-crew/users/<int:userId>', views.RemoveDeliveryCrewView.as_view()),
    
    # Cart
    path('cart/menu-items', views.CartView.as_view()),
    
    # Orders
    path('orders', views.OrdersView.as_view()),
    path('orders/<int:pk>', views.SingleOrderView.as_view()),
]