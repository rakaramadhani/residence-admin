"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { createPeraturan, deletePeraturan, fetchPeraturan, Kategori_Peraturan, Peraturan, updatePeraturan } from "./fetcher";
import MenuBar from "./MenuBar";
import PeraturanCard from "./PeraturanCard";

export default function PeraturanAdmin() {
  const [judul, setJudul] = useState("");
  const [isi_peraturan, setIsiPeraturan] = useState("");
  const [kategori, setKategori] = useState<Kategori_Peraturan>(Kategori_Peraturan.Lainnya);
  const [peraturanList, setPeraturanList] = useState<Peraturan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterKategori, setFilterKategori] = useState<string>("semua");
  const [searchText, setSearchText] = useState<string>("");

  // Untuk edit
  const [editData, setEditData] = useState<Peraturan | null>(null);
  const [id, setId] = useState<number | null>(null);

  const handleOpenModal = () => {
    setEditData(null);
    setShowModal(true);
    setJudul("");
    setKategori(Kategori_Peraturan.Lainnya);
    if (editor) {
      editor.commands.setContent("");
    }
  };

  // Buka modal untuk edit
  const handleEdit = (peraturan: Peraturan) => {
    setEditData(peraturan);
    setJudul(peraturan.judul);
    setKategori(peraturan.kategori);
    if (editor) {
      editor.commands.setContent(peraturan.isi_peraturan);
    }
    setShowModal(true);
    setId(peraturan.id);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditData(null);
    setJudul("");
    setKategori(Kategori_Peraturan.Lainnya);
    setId(null);
    if (editor) {
      editor.commands.setContent("");
    }
  };

  // Setup Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setIsiPeraturan(editor.getHTML());
    },
  });

  // Fetch data dari API
  const fetchData = async () => {
    try {
      const response = await fetchPeraturan();
      if (response && response.data) {
        setPeraturanList(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      Swal.fire("Error", "Gagal memuat data peraturan", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (id) {
        // Update peraturan
        await updatePeraturan(id, { judul, isi_peraturan, kategori });
        Swal.fire("Berhasil!", "Peraturan berhasil diperbarui!", "success");
      } else {
        // Create peraturan
        await createPeraturan({ judul, isi_peraturan, kategori });
        Swal.fire("Berhasil!", "Peraturan berhasil dibuat!", "success");
      }
      fetchData();
      setJudul("");
      setKategori(Kategori_Peraturan.Lainnya);
      if (editor) {
        editor.commands.setContent("");
      }
      setId(null); // Reset edit mode
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menyimpan peraturan:", error);
      Swal.fire("Error!", "Gagal menyimpan peraturan", "error");
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Peraturan ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    
    if (!confirm.isConfirmed) return;

    try {
      await deletePeraturan(id);
      Swal.fire("Berhasil!", "Peraturan berhasil dihapus!", "success");
      fetchData();
    } catch (error) {
      console.error("Gagal menghapus peraturan:", error);
      Swal.fire("Error!", "Gagal menghapus peraturan", "error");
    }
  };

  // Filter dan search peraturan
  const filteredPeraturan = peraturanList.filter((peraturan) => {
    // Filter kategori
    if (filterKategori !== "semua" && peraturan.kategori !== filterKategori) {
      return false;
    }
    
    // Filter pencarian
    if (
      searchText &&
      !peraturan.judul.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peraturan Cherry Field</h1>
          <p className="text-muted-foreground">Kelola peraturan dan kebijakan perumahan</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-6 items-center w-full">
          {/* Search Input - Takes remaining space */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari peraturan..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 px-3 py-3 w-full"
              />
            </div>
          </div>
          
          {/* Kategori Filter */}
          <div className="w-40">
            <Select onValueChange={setFilterKategori} defaultValue="semua">
              <SelectTrigger className="px-3 py-3">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kategori</SelectItem>
                {Object.values(Kategori_Peraturan).map((kategoriOption) => (
                  <SelectItem key={kategoriOption} value={kategoriOption}>
                    {kategoriOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Action Button */}
          <div className="w-36">
            <Button onClick={handleOpenModal} className="w-full px-3 py-3 bg-[#455AF5] hover:bg-[#455AF5]/90 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Peraturan Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Peraturan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeraturan.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Belum ada peraturan yang sesuai dengan filter</p>
          </div>
        ) : (
          filteredPeraturan.map((peraturan) => (
            <PeraturanCard
              key={peraturan.id}
              peraturan={peraturan}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editData ? "Edit Peraturan" : "Tambah Peraturan"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="judul">
                Judul <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judul"
                placeholder="Judul Peraturan"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setKategori(value as Kategori_Peraturan)} value={kategori}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Kategori_Peraturan).map((kategoriOption) => (
                    <SelectItem key={kategoriOption} value={kategoriOption}>
                      {kategoriOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Isi Peraturan <span className="text-red-500">*</span>
              </Label>
              <MenuBar editor={editor} />
              <EditorContent
                editor={editor}
                className="border rounded-md p-4 min-h-[200px] bg-white focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Batal
              </Button>
              <Button type="submit">
                {editData ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
