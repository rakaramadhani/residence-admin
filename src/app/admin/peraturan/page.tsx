"use client";
import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Swal from "sweetalert2";
import Modal from "@/components/ui/modal";
import MenuBar from "./MenuBar";
import { Edit2, Trash2, Search } from "lucide-react";
import { fetchPeraturan, createPeraturan, updatePeraturan, deletePeraturan } from "./fetcher";

enum Kategori_Peraturan {
  Keamanan = "Keamanan",
  Infrastruktur = "Infrastruktur",
  Kebersihan = "Kebersihan",
  Pelayanan = "Pelayanan",
  Lainnya = "Lainnya"
}

interface Peraturan {
  id: number;
  judul: string;
  isi_peraturan: string;
  kategori: Kategori_Peraturan;
  createdAt: string;
  updatedAt: string;
}

const PeraturanAdmin = () => {
  const [judul, setJudul] = useState("");
  const [isi_peraturan, setIsiPeraturan] = useState("");
  const [kategori, setKategori] = useState<Kategori_Peraturan>(Kategori_Peraturan.Lainnya);
  const [peraturanList, setPeraturanList] = useState<Peraturan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterKategori, setFilterKategori] = useState<string>("semua");
  const [searchText, setSearchText] = useState<string>("");

  // Untuk edit
  const [editData, setEditData] = useState<Peraturan | null>(null);
  const [id, setId] = useState<number | null>(null); // State untuk menyimpan ID peraturan yang sedang diedit

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
    <div className="min-h-screen">
      {/* Header Biru */}
      <div className="text-black p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Peraturan Cherry Field</h1>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <Modal onClose={handleCloseModal} title={editData ? "Edit Peraturan" : "Tambah Peraturan"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Judul Peraturan"
                className="w-full p-2 border rounded"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-2 border rounded"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as Kategori_Peraturan)}
                required
              >
                {Object.values(Kategori_Peraturan).map((kategoriOption) => (
                  <option key={kategoriOption} value={kategoriOption}>
                    {kategoriOption}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Isi Peraturan <span className="text-red-500">*</span>
              </label>
              <MenuBar editor={editor} />
              <EditorContent
                editor={editor}
                className="border p-4 rounded min-h-[200px] bg-white"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editData ? "Simpan Perubahan" : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="max-w-6xl mx-auto p-4">
        {/* Search dan Filter */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 mt-4 w-full ">
          <div className="relative flex-grow max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari peraturan..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Kategori :</span>
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
            >
              <option value="semua">Semua Kategori</option>
              {Object.values(Kategori_Peraturan).map((kategoriOption) => (
                <option key={kategoriOption} value={kategoriOption}>
                  {kategoriOption}
                </option>
              ))}
            </select>

            <button
              onClick={handleOpenModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-blue-700"
            >
              Peraturan Baru <span className="font-bold">+</span>
            </button>
          </div>
        </div>

        {/* List Peraturan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPeraturan.length === 0 ? (
            <p className="text-gray-500 col-span-2 text-center py-8">Belum ada peraturan.</p>
          ) : (
            filteredPeraturan.map((peraturan) => (
              <div
                key={peraturan.id}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    peraturan.kategori === Kategori_Peraturan.Keamanan 
                      ? 'bg-red-100 text-red-700' 
                      : peraturan.kategori === Kategori_Peraturan.Infrastruktur 
                      ? 'bg-blue-100 text-blue-700'
                      : peraturan.kategori === Kategori_Peraturan.Kebersihan
                      ? 'bg-green-100 text-green-700'
                      : peraturan.kategori === Kategori_Peraturan.Pelayanan
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {peraturan.kategori}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2">{peraturan.judul}</h3>
                
                <div
                  className="text-gray-700 text-sm mb-3 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: peraturan.isi_peraturan }}
                />
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                  <div className="flex items-center gap-1">
                    <span>
                      Dibuat pada: {new Date(peraturan.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Diperbarui pada: {new Date(peraturan.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(peraturan)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-blue-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(peraturan.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PeraturanAdmin;
