import { useState, useEffect } from 'react'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Move,
  Maximize,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface MerchandiseType {
  id: number
  name: string
  slug: string
}

interface PlacementOption {
  id: number
  name: string
  slug: string
  description: string | null
  position_coordinates: {
    x: number
    y: number
    maxWidth: number
    maxHeight: number
  } | null
  is_active: boolean
  sort_order: number
  merchandise_types?: MerchandiseType[]
  products_count?: number
}

export default function Placements() {
  const [placements, setPlacements] = useState<PlacementOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlacementOption | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    x: '',
    y: '',
    maxWidth: '',
    maxHeight: '',
  })

  useEffect(() => {
    fetchPlacements()
  }, [])

  const fetchPlacements = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/placements')
      setPlacements(response.data.data || response.data)
    } catch (error: any) {
      console.error('Failed to fetch placements:', error)
      toast.error('Failed to load placement options')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      x: '',
      y: '',
      maxWidth: '',
      maxHeight: '',
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: PlacementOption) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      x: item.position_coordinates?.x?.toString() || '',
      y: item.position_coordinates?.y?.toString() || '',
      maxWidth: item.position_coordinates?.maxWidth?.toString() || '',
      maxHeight: item.position_coordinates?.maxHeight?.toString() || '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description || null,
      }

      // Add position coordinates if all fields are filled
      if (formData.x && formData.y && formData.maxWidth && formData.maxHeight) {
        payload.position_coordinates = {
          x: parseFloat(formData.x),
          y: parseFloat(formData.y),
          maxWidth: parseFloat(formData.maxWidth),
          maxHeight: parseFloat(formData.maxHeight),
        }
      }

      if (editingItem) {
        await api.put(`/admin/placements/${editingItem.id}`, payload)
        toast.success('Placement option updated successfully')
      } else {
        await api.post('/admin/placements', payload)
        toast.success('Placement option created successfully')
      }

      setIsDialogOpen(false)
      fetchPlacements()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save placement option')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this placement option?')) return

    try {
      await api.delete(`/admin/placements/${id}`)
      toast.success('Placement option deleted successfully')
      fetchPlacements()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete placement option')
    }
  }

  const filteredItems = placements.filter(item =>
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
          <h1 className="text-3xl font-bold text-gray-900">Placement Options</h1>
          <p className="text-gray-600 mt-1">
            Manage logo placement positions for merchandise
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Placement Option
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search placement options..."
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
                        <MapPin className="h-6 w-6 text-purple-600" />
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
                      {item.position_coordinates && (
                        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Move className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              Position: <strong>X: {item.position_coordinates.x}, Y: {item.position_coordinates.y}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Maximize className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              Max Size: <strong>{item.position_coordinates.maxWidth} × {item.position_coordinates.maxHeight}</strong>
                            </span>
                          </div>
                        </div>
                      )}
                      {item.merchandise_types && item.merchandise_types.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600 font-medium">
                            Available on:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.merchandise_types.map((merch) => (
                              <span
                                key={merch.id}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {merch.name}
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
                No placement options found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Placement Option' : 'Create Placement Option'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Front"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Front center placement"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="x">Position X</Label>
                <Input
                  id="x"
                  type="number"
                  value={formData.x}
                  onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                  placeholder="150"
                />
              </div>
              <div>
                <Label htmlFor="y">Position Y</Label>
                <Input
                  id="y"
                  type="number"
                  value={formData.y}
                  onChange={(e) => setFormData({ ...formData, y: e.target.value })}
                  placeholder="120"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxWidth">Max Width</Label>
                <Input
                  id="maxWidth"
                  type="number"
                  value={formData.maxWidth}
                  onChange={(e) => setFormData({ ...formData, maxWidth: e.target.value })}
                  placeholder="280"
                />
              </div>
              <div>
                <Label htmlFor="maxHeight">Max Height</Label>
                <Input
                  id="maxHeight"
                  type="number"
                  value={formData.maxHeight}
                  onChange={(e) => setFormData({ ...formData, maxHeight: e.target.value })}
                  placeholder="350"
                />
              </div>
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
