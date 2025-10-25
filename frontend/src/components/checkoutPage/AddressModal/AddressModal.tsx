import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './AddressModal.module.scss';
import { X, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import AddressFormModal from '../AddressFormModal/AddressFormModal';
import {
    getAllAddresses,
    setDefaultAddress,
    AddressDelivery
} from '../../../services/addressDelivery/addressApi'; 

const cx = classNames.bind(styles);

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAddress: AddressDelivery | null;
    onSelectAddress: (address: AddressDelivery) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
    isOpen,
    onClose,
    currentAddress,
    onSelectAddress
}) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<AddressDelivery | null>(null);

    const [addresses, setAddresses] = useState<AddressDelivery[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(currentAddress?.id || null);
    const [isConfirming, setIsConfirming] = useState(false); 

    useEffect(() => {
        if (isOpen) {
            const fetchAddresses = async () => {
                setIsLoading(true);
                setAddresses([]); 
                try {
                    const fetchedAddresses = await getAllAddresses();
                    setAddresses(fetchedAddresses);
                    setSelectedAddressId(currentAddress?.id || fetchedAddresses.find(a => a.isDefault)?.id || null);
                } catch (error: any) {
                    console.error("Failed to fetch addresses:", error);
                    toast.error(error.message || "Could not load addresses.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAddresses();
        }
    }, [isOpen, currentAddress]); 
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAddressId(e.target.value);
    };

    const handleConfirm = async () => {
        if (!selectedAddressId) {
            toast.warn("Please select an address.");
            return;
        }

        const newlySelectedAddress = addresses.find(addr => addr.id === selectedAddressId);
        if (!newlySelectedAddress) {
            toast.error("Selected address not found."); 
            return;
        }

        if (currentAddress?.id === selectedAddressId) {
            onClose();
            return;
        }

        setIsConfirming(true);
        try {
            let addressToUpdateCheckout: AddressDelivery;

            if (!newlySelectedAddress.isDefault) {
                // Call API to set this address as default
                addressToUpdateCheckout = await setDefaultAddress(selectedAddressId);
                toast.success("Default address updated successfully.");
            } else {
                // If it was already default, just use its data
                addressToUpdateCheckout = newlySelectedAddress;
            }

            // Update the address in CheckoutPage state
            onSelectAddress(addressToUpdateCheckout);
            onClose(); // Close modal

        } catch (error: any) {
            console.error("Failed to set default address:", error);
            toast.error(error.message || "Could not update default address.");
        } finally {
            setIsConfirming(false);
        }
    };

    const openAddForm = () => {
        setAddressToEdit(null); 
        setIsFormModalOpen(true);
    };

    const openEditForm = (address: AddressDelivery) => {
        setAddressToEdit(address); 
        setIsFormModalOpen(true);
    };

    const handleAddAddress = () => {
        alert("Navigate to Add Address Page/Modal");
    };
    const handleEditAddress = (addressId: string) => {
        alert(`Maps to Edit Address Page/Modal for ID: ${addressId}`);
    };

    const handleSaveSuccess = (savedAddress: AddressDelivery) => {
        const fetchAddresses = async () => {
             setIsLoading(true); 
             try {
                 const refreshedAddresses = await getAllAddresses();
                 setAddresses(refreshedAddresses);
             } catch {}
             finally { setIsLoading(false); }
        };
        fetchAddresses();
        setIsFormModalOpen(false); 
    };


    if (!isOpen) return null;

    if (isFormModalOpen) {
        return (
            <AddressFormModal
                isOpen={true}
                onClose={() => setIsFormModalOpen(false)} 
                onSaveSuccess={handleSaveSuccess}
                initialData={addressToEdit}
            />
        );
    }

    return (
        <div className={cx('modalOverlay')} onClick={onClose}>
            <div className={cx('modalContent')} onClick={(e) => e.stopPropagation()}>
                <div className={cx('header')}>
                    <h2 className={cx('title')}>My Addresses</h2>
                    <button className={cx('closeButton')} onClick={onClose} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className={cx('addressList')}>
                    {isLoading ? (
                        <div className={cx('loading')}>Loading addresses...</div>
                    ) : addresses.length > 0 ? (
                        addresses.map((addr) => (
                            <div key={addr.id} className={cx('addressItem')}>
                                <div className={cx('radioInput')}>
                                    <input
                                        type="radio"
                                        name="deliveryAddress"
                                        value={addr.id}
                                        checked={selectedAddressId === addr.id}
                                        onChange={handleRadioChange}
                                        id={`addr-${addr.id}`} // For label association
                                    />
                                </div>
                                <label htmlFor={`addr-${addr.id}`} className={cx('itemDetails')}> {/* Use label for click */}
                                    <div className={cx('info')}>
                                        <div className={cx('namePhone')}>
                                            {addr.fullName} (+{addr.phoneNumber})
                                            {addr.isDefault && (
                                                <span className={cx('defaultTag')}>Default</span>
                                            )}
                                        </div>
                                        <div className={cx('addressLine')}>{addr.address}</div>
                                    </div>
                                   <div className={cx('actions')}>
                                        <button type="button" className={cx('editButton')} onClick={(e) => { e.stopPropagation(); openEditForm(addr); }}>
                                            Update
                                        </button>
                                    </div>
                                </label>
                            </div>
                        ))
                    ) : (
                        <div className={cx('empty')}>No addresses found. Add one below!</div>
                    )}
                </div>

                {/* Add New Address Button */}
                 <button type="button" className={cx('addNewButton')} onClick={openAddForm}>
                    <Plus size={18} /> Add New Address
                </button>


                <div className={cx('footer')}>
                    <button type="button" className={cx('cancelButton')} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={cx('confirmButton')}
                        onClick={handleConfirm}
                        disabled={isConfirming || !selectedAddressId || selectedAddressId === currentAddress?.id} // Disable if confirming, nothing selected, or selection hasn't changed
                    >
                        {isConfirming ? 'Confirming...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;