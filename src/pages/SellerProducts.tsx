
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import SellerLayout from "../components/layout/SellerLayout";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  description: string;
}

const SellerProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const productsQuery = query(
      collection(db, "products"), 
      where("sellerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      toast({
        title: "Produk dihapus",
        description: "Produk berhasil dihapus dari toko Anda",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus produk",
        variant: "destructive",
      });
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src !== "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=100&h=100") {
      target.src = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=100&h=100";
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        {/* Header */}
        <div className="bg-[#07595A] px-4 py-4 flex justify-between items-center rounded-b-3xl">
          <div>
            <h1 className="text-white text-2xl font-semibold">Kelola Produk</h1>
            <p className="text-white/80 text-sm">{products.length} produk</p>
          </div>
          <Link to="/seller/products/add">
            <Button className="bg-white text-[#07595A] hover:bg-gray-100">
              <Plus className="w-5 h-5 mr-2" />
              Tambah
            </Button>
          </Link>
        </div>

        {/* Products List */}
        <div className="p-4">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg mb-2">Belum ada produk</p>
              <p className="text-white/50 text-sm mb-6">Tambahkan produk pertama Anda</p>
              <Link to="/seller/products/add">
                <Button className="bg-[#07595A] text-white hover:bg-[#065658]">
                  <Plus className="w-5 h-5 mr-2" />
                  Tambah Produk
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image && product.image.trim() !== "" 
                        ? product.image 
                        : "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=100&h=100"
                      }
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={handleImageError}
                      onLoad={(e) => {
                        console.log(`✅ Image loaded successfully for ${product.name}:`, product.image);
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                      <p className="text-white/70 text-sm">{product.category}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-white font-bold">Rp {product.price.toLocaleString()}</span>
                        <span className="text-white/70 text-sm">Stok: {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/seller/products/edit/${product.id}`}>
                        <Button size="sm" variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-red-500/80 hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerProducts;
