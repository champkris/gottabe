import { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Shirt,
  DollarSign,
  MapPin,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PlacementOption {
  id: number
  name: string
  slug: string
  pivot?: {
    price_modifier: number
  }
}

interface MerchandiseType {
  id: number
  name: string
  slug: string
  description: string | null
  base_price: number
  template_image: string | null
  sizes: string[]
  colors: Array<{ name: string; code: string }>
  is_active: boolean
  sort_order: number
  placement_options?: PlacementOption[]
  products_count?: number
}

export default function Merchandise() {
  const [merchandiseTypes, setMerchandiseTypes] = useState<MerchandiseType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MerchandiseType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    sizes: '',
    colors: '',
  })

  useEffect(() => {
    fetchMerchandiseTypes()
  }, [])

  const fetchMerchandiseTypes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/merchandise')
      setMerchandiseTypes(response.data.data || response.data)
    } catch (error: any) {
      console.error('Failed to fetch merchandise types:', error)
      toast.error('Failed to load merchandise types')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      base_price: '',
      sizes: '',
      colors: '',
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: MerchandiseType) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      base_price: item.base_price.toString(),
      sizes: item.sizes?.join(', ') || '',
      colors: item.colors?.map(c => `${c.name}:${c.code}`).join(', ') || '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const sizes = formData.sizes.split(',').map(s => s.trim()).filter(Boolean)
      const colors = formData.colors
        .split(',')
        .map(c => {
          const [name, code] = c.trim().split(':')
          return name && code ? { name: name.trim(), code: code.trim() } : null
        })
        .filter(Boolean)

      const payload = {
        name: formData.name,
        description: formData.description || null,
        base_price: parseFloat(formData.base_price),
        sizes,
        colors,
      }

      if (editingItem) {
        await api.put(`/admin/merchandise/${editingItem.id}`, payload)
        toast.success('Merchandise type updated successfully')
      } else {
        await api.post('/admin/merchandise', payload)
        toast.success('Merchandise type created successfully')
      }

      setIsDialogOpen(false)
      fetchMerchandiseTypes()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save merchandise type')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this merchandise type?')) return

    try {
      await api.delete(`/admin/merchandise/${id}`)
      toast.success('Merchandise type deleted successfully')
      fetchMerchandiseTypes()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete merchandise type')
    }
  }

  const filteredItems = merchandiseTypes.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchandise Types</h1>
          <p className="text-gray-600 mt-1">
            Manage merchandise types and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Merchandise Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search merchandise types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-purple-600">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Shirt className="h-6 w-6 text-purple-600" />
                        <h3 className="text-xl font-semibold">{item.name}</h3>
                        {!item.is_active && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-gray-600 mb-4">{item.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            Base Price: <strong>{formatCurrency(item.base_price)}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            Products: <strong>{item.products_count || 0}</strong>
                          </span>
                        </div>
                      </div>
                      {item.sizes && item.sizes.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600 font-medium">Sizes: </span>
                          <span className="text-sm">{item.sizes.join(', ')}</span>
                        </div>
                      )}
                      {item.colors && item.colors.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600 font-medium">Colors: </span>
                          <div className="flex gap-2 mt-1">
                            {item.colors.map((color, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                              >
                                <div
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: color.code }}
                                />
                                {color.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.placement_options && item.placement_options.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Available Placements:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.placement_options.map((placement) => (
                              <span
                                key={placement.id}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                              >
                                {placement.name}
                                {placement.pivot?.price_modifier ? (
                                  <span className="ml-1 text-purple-900">
                                    (+{formatCurrency(placement.pivot.price_modifier)})
                                  </span>
                                ) : null}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No merchandise types found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Merchandise Type' : 'Create Merchandise Type'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="T-Shirt Regular"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Classic fit cotton t-shirt"
              />
            </div>
            <div>
              <Label htmlFor="base_price">Base Price (THB)</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                placeholder="299.00"
              />
            </div>
            <div>
              <Label htmlFor="sizes">
                Sizes (comma-separated)
              </Label>
              <Input
                id="sizes"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="S, M, L, XL, 2XL"
              />
            </div>
            <div>
              <Label htmlFor="colors">
                Colors (format: Name:HexCode, comma-separated)
              </Label>
              <Input
                id="colors"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder="White:#FFFFFF, Black:#000000, Navy:#001f3f"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
