
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Save, Image, X } from "lucide-react";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerValidation } from "@/hooks/useSellerValidation";

const categories = [
  "Makanan Berat",
  "Makanan Ringan", 
  "Minuman",
  "Dessert",
  "Makanan Tradisional",
  "Fast Food"
];

const AddEditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { toast } = useToast();
  const { currentUser, getSellerData } = useAuth();
  const { validateSeller, isValidating } = useSellerValidation();
  const isEditing = !!productId;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: ""
  });
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditing);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [authValidated, setAuthValidated] = useState(false);

  // Validate seller auth on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🚀 Initializing seller authentication validation...");
      
      if (!currentUser) {
        console.error("❌ No current user, redirecting to login");
        toast({
          title: "Error",
          description: "Anda harus login terlebih dahulu",
          variant: "destructive",
        });
        navigate("/login-seller");
        return;
      }

      // Validate seller authentication
      const isValid = await validateSeller();
      
      if (!isValid) {
        console.error("❌ Seller validation failed, redirecting to dashboard");
        navigate("/seller-dashboard");
        return;
      }

      console.log("✅ Seller authentication validated successfully");
      setAuthValidated(true);
    };

    initializeAuth();
  }, [currentUser, validateSeller, navigate, toast]);

  useEffect(() => {
    if (isEditing && productId && authValidated) {
      loadProduct();
    }
  }, [isEditing, productId, authValidated]);

  const loadProduct = async () => {
    try {
      console.log("📦 Loading product:", productId);
      const productDoc = await getDoc(doc(db, "products", productId!));
      if (productDoc.exists()) {
        const data = productDoc.data();
        console.log("✅ Product data loaded:", data);
        
        // Verify product belongs to current seller
        if (data.sellerId !== currentUser?.uid) {
          console.error("❌ Product doesn't belong to current seller");
          toast({
            title: "Error",
            description: "Anda tidak memiliki izin untuk mengedit produk ini",
            variant: "destructive",
          });
          navigate("/seller/products");
          return;
        }
        
        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          stock: data.stock?.toString() || "",
          category: data.category || "",
          image: data.image || ""
        });
        setPreviewUrl(data.image || "");
        setUploadMethod('url');
      } else {
        console.error("❌ Product not found");
        toast({
          title: "Error",
          description: "Produk tidak ditemukan",
          variant: "destructive",
        });
        navigate("/seller/products");
      }
    } catch (error) {
      console.error("❌ Error loading product:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data produk",
        variant: "destructive",
      });
      navigate("/seller/products");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "File harus berupa gambar",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 2MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      setUploadMethod('file');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setFormData(prev => ({ ...prev, image: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Starting form submission...");
    console.log("📋 Form data:", formData);
    console.log("🖼️ Image file:", imageFile);
    console.log("👤 Current user:", currentUser?.uid);

    // Pre-submission validation
    if (!authValidated) {
      console.error("❌ Authentication not validated");
      toast({
        title: "Error",
        description: "Autentikasi belum tervalidasi. Silakan refresh halaman.",
        variant: "destructive",
      });
      return;
    }

    // Validate seller again before submission
    const isSellerValid = await validateSeller();
    if (!isSellerValid) {
      console.error("❌ Seller validation failed during submission");
      return;
    }

    // Form validation
    if (!formData.name.trim() || !formData.category || !formData.price || !formData.stock) {
      toast({
        title: "Error",
        description: "Semua field wajib harus diisi",
        variant: "destructive",
      });
      return;
    }

    const price = parseInt(formData.price);
    const stock = parseInt(formData.stock);
    
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Harga harus berupa angka positif",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Error",
        description: "Stok harus berupa angka positif atau nol",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get fresh seller data
      const sellerData = await getSellerData();
      console.log("🏪 Seller data retrieved:", {
        uid: sellerData.uid,
        storeName: sellerData.storeName,
        role: sellerData.role
      });

      let imageUrl = formData.image;

      // Handle image upload
      if (imageFile) {
        console.log("🖼️ Processing image file...");
        // For now, use placeholder - in production implement proper image hosting
        imageUrl = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=300&h=200";
        console.log("✅ Using placeholder image URL");
      }

      // Use default image if no image provided
      if (!imageUrl) {
        imageUrl = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=300&h=200";
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        stock: stock,
        category: formData.category,
        image: imageUrl,
        sellerId: currentUser!.uid,
        sellerName: sellerData.name || sellerData.storeName || "Unknown Seller",
        storeName: sellerData.storeName || `${sellerData.name}'s Store`,
        updatedAt: new Date(),
        // Add metadata for better tracking
        status: 'active',
        isAvailable: stock > 0
      };

      console.log("💾 Product data to save:", productData);

      if (isEditing) {
        console.log("📝 Updating product:", productId);
        await updateDoc(doc(db, "products", productId!), productData);
        
        toast({
          title: "Berhasil",
          description: "Produk berhasil diperbarui",
        });
        console.log("✅ Product updated successfully");
      } else {
        console.log("🆕 Creating new product...");
        const docRef = await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date()
        });
        
        console.log("✅ Product created with ID:", docRef.id);
        toast({
          title: "Berhasil",
          description: "Produk berhasil ditambahkan",
        });
      }

      // Redirect to products list
      navigate("/seller/products");
      
    } catch (error) {
      console.error("❌ Error saving product:", error);
      
      // Enhanced error handling
      let errorMessage = "Gagal menyimpan produk";
      
      if (error instanceof Error) {
        console.log("📝 Error details:", {
          message: error.message,
          code: (error as any).code,
          stack: error.stack
        });
        
        if (error.message.includes('permission-denied') || (error as any).code === 'permission-denied') {
          errorMessage = "Tidak memiliki izin untuk menyimpan produk. Pastikan Anda sudah login sebagai seller yang terverifikasi.";
        } else if (error.message.includes('unauthenticated') || (error as any).code === 'unauthenticated') {
          errorMessage = "Sesi login telah berakhir. Silakan login kembali.";
        } else if (error.message.includes('network')) {
          errorMessage = "Masalah koneksi internet. Silakan coba lagi.";
        } else if (error.message.includes('quota')) {
          errorMessage = "Kuota database tercapai. Silakan coba lagi nanti.";
        } else {
          errorMessage = `Gagal menyimpan produk: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    setFormData(prev => ({ ...prev, image: "" }));
  };

  // Show loading if not authenticated yet
  if (!authValidated || loadingProduct || isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center">
        <div className="text-white text-xl">
          {isValidating ? "Validating seller..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
      {/* Header */}
      <div className="bg-[#07595A] px-4 py-4 flex items-center gap-4 rounded-b-3xl">
        <button
          onClick={() => navigate("/seller/products")}
          className="text-white p-2 hover:bg-white/20 rounded-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-white text-2xl font-semibold">
            {isEditing ? "Edit Produk" : "Tambah Produk"}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nama Produk</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama produk"
                required
                className="bg-white/20 border-white/30 text-white placeholder-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi produk"
                rows={3}
                className="bg-white/20 border-white/30 text-white placeholder-white/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white">Harga (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                  required
                  min="1"
                  className="bg-white/20 border-white/30 text-white placeholder-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-white">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                  required
                  min="0"
                  className="bg-white/20 border-white/30 text-white placeholder-white/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Kategori</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label className="text-white text-lg font-semibold">Gambar Produk</Label>
              
              {/* Upload Method Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  variant={uploadMethod === 'url' ? 'default' : 'outline'}
                  size="sm"
                  className={uploadMethod === 'url' 
                    ? "bg-[#07595A] text-white" 
                    : "bg-white/20 text-white border-white/30"
                  }
                >
                  URL Gambar
                </Button>
                <Button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  variant={uploadMethod === 'file' ? 'default' : 'outline'}
                  size="sm"
                  className={uploadMethod === 'file' 
                    ? "bg-[#07595A] text-white" 
                    : "bg-white/20 text-white border-white/30"
                  }
                >
                  Upload File
                </Button>
              </div>

              {uploadMethod === 'url' ? (
                <div className="space-y-2">
                  <Label htmlFor="image-url" className="text-white/80">URL Gambar</Label>
                  <Input
                    id="image-url"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, image: e.target.value }));
                      if (e.target.value) {
                        setImageFile(null);
                        setPreviewUrl(e.target.value);
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="bg-white/20 border-white/30 text-white placeholder-white/50"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-white/80">Upload dari Perangkat</Label>
                  
                  {/* File Upload Area */}
                  <div className="relative">
                    <div className="border-2 border-dashed border-white/30 rounded-lg p-6 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                        <div className="text-white/80 mb-2">
                          Pilih gambar atau drag & drop
                        </div>
                        <div className="text-white/60 text-sm mb-4">
                          JPG, PNG, GIF - Max 2MB
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                          size="sm"
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Preview Gambar</Label>
                  <Button
                    type="button"
                    onClick={clearImage}
                    variant="outline"
                    size="sm"
                    className="bg-red-500/20 text-red-200 border-red-300/30 hover:bg-red-500/30"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                </div>
                <div className="relative overflow-hidden rounded-lg bg-white/10">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 sm:h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=300&h=200";
                    }}
                  />
                  {imageFile && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded max-w-[calc(100%-1rem)] truncate">
                      {imageFile.name}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || isValidating}
              className="w-full bg-[#07595A] hover:bg-[#065658] text-white py-3"
              size="lg"
            >
              {loading ? (
                "Menyimpan..."
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {isEditing ? "Perbarui Produk" : "Tambah Produk"}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditProduct;
