import React, { useEffect } from 'react'
import { Button } from './ui/button'
import { FaRegTrashAlt } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete this item?",
    description = "This action is permanent and cannot be undone.",
}) => {
    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        if (isOpen) window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog card */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden
                            animate-in fade-in zoom-in-95 duration-200">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <IoClose size={20} />
                </button>

                {/* Red accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-red-400 to-rose-500" />

                <div className="flex flex-col items-center text-center px-6 py-7 gap-4">
                    {/* Icon bubble */}
                    <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center">
                        <FaRegTrashAlt className="text-red-500" size={24} />
                    </div>

                    {/* Text */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 w-full mt-1">
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium border-0"
                            onClick={() => { onConfirm(); onClose() }}
                        >
                            Yes, delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
