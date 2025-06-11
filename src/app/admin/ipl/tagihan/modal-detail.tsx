'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Tagihan } from './fetcher';

interface ModalDetailTagihanProps {
  isOpen: boolean;
  onClose: () => void;
  tagihan: Tagihan | null;
  onUpdate: () => void;
}

export default function ModalDetailTagihan({ 
  isOpen, 
  onClose, 
  tagihan 
}: ModalDetailTagihanProps) {
  const bulanOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const getBulanNama = (bulan: number) => {
    const bulanObj = bulanOptions.find(b => b.value === bulan);
    return bulanObj ? bulanObj.label : bulan.toString();
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    if (status === 'lunas') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  if (!tagihan) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-25"
          leave="ease-in duration-200"
          leaveFrom="opacity-25"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black opacity-25 " />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Informasi Tagihan
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Nomor Tagihan : </span>
                      <span className="text-sm text-gray-700">{tagihan.id}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Pengguna : </span>
                      <span className="text-sm text-gray-700">{tagihan.user?.username || 'Belum Mengisikan'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Email : </span>
                      <span className="text-sm text-gray-700">{tagihan.user?.email || 'Belum Memiliki Email'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Kontak : </span>
                      <span className="text-sm text-gray-700">{tagihan.user?.phone || 'Belum Mengisikan'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Rumah : </span>
                      <span className="text-sm text-gray-700">
                      {tagihan.user?.cluster + ' No. ' + tagihan.user?.nomor_rumah || 'Belum Mengisikan'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Bulan : </span>
                      <span className="text-sm text-gray-700">{getBulanNama(tagihan.bulan)} {tagihan.tahun}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Nominal Tagihan : </span>
                      <span className="text-sm text-gray-700 font-semibold">
                        Rp. {tagihan.nominal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">Status Tagihan : </span>
                      <span className={getStatusBadge(tagihan.status_bayar)}>
                        {tagihan.status_bayar === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Tutup
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
