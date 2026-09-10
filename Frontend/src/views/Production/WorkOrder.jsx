import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { getWorkOrders, saveWorkOrder, deleteWorkOrder } from '../../services/productionApi';

const WorkOrder = () => {
  const [form, setForm] = useState({ wo_number: '', po_number: '', item_name: '', item_qty: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workOrders, setWorkOrders] = useState([]);

  const fetchData = async () => {
    try {
      const res = await getWorkOrders();
      setWorkOrders(res.data || []);
      setError(''); // Clear error if fetch is successful
    } catch (err) {
      console.error("Fetch Error:", err);
      setError('Failed to fetch work orders. Please check if the database table exists.');
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); 
    setSuccess('');
    
    if (!form.wo_number || !form.item_name || !form.item_qty) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        wo_number: form.wo_number,
        po_number: form.po_number,
        item_name: form.item_name,
        item_qty: parseInt(form.item_qty, 10) || 0,
        mode: 'INSERT'
      };

      const response = await saveWorkOrder(payload);
      
      setSuccess(response.data.message || 'Work Order created successfully!');
      setForm({ wo_number: '', po_number: '', item_name: '', item_qty: 0 });
      await fetchData(); // Refresh table
      
    } catch (err) {
      console.error("Save Error:", err);
      setError(err.response?.data?.error || 'Failed to save work order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Work Order</h3>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>WO Number</Form.Label>
                  <Form.Control name="wo_number" value={form.wo_number} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>PO Number</Form.Label>
                  <Form.Control name="po_number" value={form.po_number} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control name="item_name" value={form.item_name} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Item Qty</Form.Label>
                  <Form.Control type="number" name="item_qty" value={form.item_qty} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : 'OK'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header>Work Order List</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>S.No</th>
                <th>WO Number</th>
                <th>PO Number</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Order Qty</th>
                <th>Balance Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workOrders && workOrders.length > 0 ? (
                workOrders.map((wo, index) => (
                  <tr key={wo.id}>
                    <td>{index + 1}</td>
                    <td>{wo.wo_number}</td>
                    <td>{wo.po_number}</td>
                    <td>{wo.item_code}</td>
                    <td>{wo.item_name}</td>
                    <td>{wo.order_qty}</td>
                    <td>{wo.balance_qty}</td>
                    <td>
                      <span className={`badge bg-${wo.status === 'Completed' ? 'success' : 'warning'}`}>
                        {wo.status}
                      </span>
                    </td>
                    <td>
                      <Button size="sm" variant="outline-danger" onClick={async () => { 
                        await deleteWorkOrder(wo.id); 
                        fetchData(); 
                      }}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted">No Work Orders Found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WorkOrder;