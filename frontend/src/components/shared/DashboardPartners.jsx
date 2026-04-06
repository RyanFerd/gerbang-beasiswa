import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineExclamationCircle, HiCheck, HiX } from "react-icons/hi";
import { FaBuilding } from "react-icons/fa";

export default function DashboardPartners() {
  const { currentUser } = useSelector((state) => state.user);
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [partnerIdToDelete, setPartnerIdToDelete] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch(`/api/user/partners`);
        const data = await res.json();
        if (res.ok) {
          setPartners(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchPartners();
    }
  }, [currentUser._id]);

  // --- APPROVE ---
  const handleApprove = async (userId) => {
    try {
      const res = await fetch(`/api/user/approve/${userId}`, {
        method: "PUT",
      });
      if (res.ok) {
        setPartners((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isApproved: true } : user
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // --- REJECT / DELETE ---
  const handleDeletePartner = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/user/reject/${partnerIdToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPartners((prev) => prev.filter((user) => user._id !== partnerIdToDelete));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className='w-full p-3'>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-3 bg-blue-50 rounded-full">
            <FaBuilding className="text-2xl text-blue-600" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-gray-800">Verifikasi Mitra Institusi</h1>
            <p className="text-sm text-gray-500">Kelola pendaftaran akun mitra beasiswa</p>
        </div>
      </div>

      {currentUser.isAdmin && partners.length > 0 ? (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Tanggal Daftar</th>
                <th scope="col" className="px-6 py-3">Nama Organisasi</th>
                <th scope="col" className="px-6 py-3">Penanggung Jawab</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Website</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {new Date(partner.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {partner.organizationName}
                  </td>
                  <td className="px-6 py-4">{partner.username}</td>
                  <td className="px-6 py-4">{partner.email}</td>
                  <td className="px-6 py-4">
                    {partner.website ? (
                        <a href={partner.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Link</a>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {partner.isApproved ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-400">
                        Aktif
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-yellow-300 animate-pulse">
                        Menunggu
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!partner.isApproved ? (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleApprove(partner._id)}
                                className='flex items-center text-green-600 hover:text-green-900 font-medium'
                                title="Terima"
                            >
                                <HiCheck className="text-xl mr-1"/> Terima
                            </button>
                            <button 
                                onClick={() => {
                                    setShowModal(true);
                                    setPartnerIdToDelete(partner._id);
                                }}
                                className='flex items-center text-red-600 hover:text-red-900 font-medium'
                                title="Tolak"
                            >
                                <HiX className="text-xl mr-1"/> Tolak
                            </button>
                        </div>
                    ) : (
                        <span className="text-gray-400 italic text-xs flex items-center">
                            <HiCheck className="mr-1"/> Terverifikasi
                        </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
            <FaBuilding className="text-4xl text-gray-300 mb-2" />
            <p className="text-gray-500">Belum ada data pendaftaran mitra.</p>
        </div>
      )}

      {/* --- MODAL (MANUAL TAILWIND) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-700 mx-4">
            
            {/* Modal Close Button */}
            <button 
                onClick={() => setShowModal(false)}
                type="button" 
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            >
                <HiX className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div className="p-6 text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 text-gray-400 w-14 h-14" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Yakin ingin menolak dan menghapus mitra ini?
              </h3>
              
              <div className="flex justify-center gap-4">
                <button 
                    onClick={handleDeletePartner}
                    className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                    Ya, Tolak
                </button>
                <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                >
                    Batal
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}