import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Save, X, Truck, Package } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface Order {
  _id: string;
  orderItems: Array<{
    title: string;
    qty: number;
    price: number;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    deliveryContactNumber?: string;
  };
  shippingPrice: number;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

const DeliveryPriceManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [newShippingPrice, setNewShippingPrice] = useState('');
  const [newDeliveryContact, setNewDeliveryContact] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders');
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setLoading(false);
    }
  };

  const updateShippingPrice = async (orderId: string) => {
    if (!newShippingPrice || isNaN(Number(newShippingPrice))) {
      toast.error('Please enter a valid shipping price');
      return;
    }

    try {
      await api.put(`/api/orders/${orderId}/shipping`, {
        shippingPrice: Number(newShippingPrice),
        deliveryContactNumber: newDeliveryContact || undefined,
        shippingNote: 'Updated by admin',
        updatedBy: 'admin'
      });

      toast.success('Shipping information updated successfully');
      setEditingOrder(null);
      setNewShippingPrice('');
      setNewDeliveryContact('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating shipping price:', error);
      toast.error('Failed to update shipping information');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.postalCode.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-green-100 text-green-800';
      case 'Delivered': return 'bg-purple-100 text-purple-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Delivery Price Management</h1>
          <p className="text-muted-foreground">Manage and update shipping prices for orders</p>
        </motion.div>



        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by order ID, customer name, email, or pincode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Delivery Contact</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Current Shipping</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-sm">{order._id.slice(-8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{order.shippingAddress.city}</p>
                          <p className="text-xs text-muted-foreground">{order.shippingAddress.postalCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {order.shippingAddress.deliveryContactNumber || 'Not added'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{order.orderItems.length} items</p>
                        <p className="text-xs text-muted-foreground">₹{order.totalPrice - order.shippingPrice}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">₹{order.shippingPrice}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingOrder === order._id ? (
                          <div className="flex flex-col gap-2 min-w-[220px]">
                            <Input
                              type="number"
                              placeholder="Shipping price (₹)"
                              value={newShippingPrice}
                              onChange={(e) => setNewShippingPrice(e.target.value)}
                              className="h-8 text-sm"
                            />
                            <Input
                              type="text"
                              placeholder="Delivery contact"
                              value={newDeliveryContact}
                              onChange={(e) => setNewDeliveryContact(e.target.value)}
                              className="h-8 text-sm"
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => updateShippingPrice(order._id)}
                                className="flex-1 h-7 text-xs"
                              >
                                <Save className="h-3 w-3 mr-1" /> Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingOrder(null);
                                  setNewShippingPrice('');
                                  setNewDeliveryContact('');
                                }}
                                className="flex-1 h-7 text-xs"
                              >
                                <X className="h-3 w-3 mr-1" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingOrder(order._id);
                              setNewShippingPrice(order.shippingPrice.toString());
                              setNewDeliveryContact(order.shippingAddress.deliveryContactNumber || '');
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DeliveryPriceManagement;
