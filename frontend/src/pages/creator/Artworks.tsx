import { useState, useEffect } from 'react'
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  Upload,
  FileImage,
  X,
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

interface Artwork {
  id: number
  name: string
  description: string | null
  file_path: string
  file_url: string
  file_type: string
  width: number
  height: number
  file_size: number
  is_active: boolean
  products_count?: number
  created_at: string
}

export default function Artworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/creator/artworks')
      setArtworks(response.data.data || response.data)
    } catch (error: any) {
      console.error('Failed to fetch artworks:', error)
      toast.error('Failed to load artworks')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !formData.name) {
      toast.error('Please select a file and provide a name')
      return
    }

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)
      uploadFormData.append('name', formData.name)
      if (formData.description) {
        uploadFormData.append('description', formData.description)
      }

      await api.post('/creator/artworks', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Artwork uploaded successfully')
      setIsUploadDialogOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      setFormData({ name: '', description: '' })
      fetchArtworks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload artwork')
    }
  }

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork)
    setFormData({
      name: artwork.name,
      description: artwork.description || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingArtwork) return

    try {
      await api.put(`/creator/artworks/${editingArtwork.id}`, formData)
      toast.success('Artwork updated successfully')
      setIsEditDialogOpen(false)
      setEditingArtwork(null)
      setFormData({ name: '', description: '' })
      fetchArtworks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update artwork')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return

    try {
      await api.delete(`/creator/artworks/${id}`)
      toast.success('Artwork deleted successfully')
      fetchArtworks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete artwork')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const filteredArtworks = artworks.filter(artwork =>
    artwork.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">My Artworks</h1>
          <p className="text-gray-600 mt-1">
            Upload and manage your logos and designs
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Upload className="mr-2 h-4 w-4" />
          Upload Artwork
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArtworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                  <img
                    src={artwork.file_url}
                    alt={artwork.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{artwork.name}</h3>
                  {artwork.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {artwork.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    <div>Size: {artwork.width} × {artwork.height}px</div>
                    <div>File Size: {formatFileSize(artwork.file_size)}</div>
                    <div>Type: {artwork.file_type.toUpperCase()}</div>
                    {artwork.products_count !== undefined && (
                      <div className="text-purple-600 font-medium">
                        Used in {artwork.products_count} product{artwork.products_count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(artwork)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(artwork.id)}
                      disabled={artwork.products_count && artwork.products_count > 0}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredArtworks.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <FileImage className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>No artworks found</p>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="mt-4"
                >
                  Upload your first artwork
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Artwork</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Image File</Label>
              <div className="mt-2">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full p-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedFile(null)
                          setPreviewUrl(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG, or SVG (Max 10MB)
                      </p>
                    </div>
                  )}
                  <input
                    id="file"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="name">Artwork Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Logo Design"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your artwork..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} className="bg-purple-600 hover:bg-purple-700">
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Artwork</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Artwork Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-purple-600 hover:bg-purple-700">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
