import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Package, Truck, Phone, MapPin, CreditCard, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  title: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    deliveryContactNumber?: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  status: string;
  createdAt: string;
  deliveredAt?: string;
  paidAt?: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders/myorders');
      setOrders(response.data);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-orange-100 text-orange-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Cancellation Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing': return <Clock className="h-4 w-4" />;
      case 'Shipped': return <Truck className="h-4 w-4" />;
      case 'Delivered': return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>My Orders | Sri Chola Book Shop</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your book orders</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">You haven't placed any orders. Start exploring our books!</p>
            <Button onClick={() => window.location.href = '/books'}>
              Browse Books
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Order Items */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Items</h3>
                      {order.orderItems.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{item.price}</p>
                            <p className="text-sm text-muted-foreground">each</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Shipping & Delivery Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Delivery Address
                        </h3>
                        <div className="text-sm space-y-1">
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                          <p>{order.shippingAddress.country}</p>
                          {order.shippingAddress.deliveryContactNumber && (
                            <div className="flex items-center gap-2 text-green-600">
                              <Phone className="h-3 w-3" />
                              <span>{order.shippingAddress.deliveryContactNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Delivery Information
                        </h3>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Delivery Contact:</span>
                            <span className="font-medium">
                              {order.shippingAddress.deliveryContactNumber || 'Not provided'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping Cost:</span>
                            <span className="font-medium">₹{order.shippingPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Method:</span>
                            <span className="font-medium capitalize">{order.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₹{order.itemsPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>₹{order.shippingPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>₹{order.taxPrice}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>₹{order.totalPrice}</span>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Payment Status</p>
                          <p className="text-sm text-muted-foreground">
                            {order.isPaid ? `Paid on ${new Date(order.paidAt || '').toLocaleDateString()}` : 'Pending'}
                          </p>
                        </div>
                      </div>
                      <Badge className={order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrders;
