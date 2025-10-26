// AddressFormModal.tsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './AddressFormModal.module.scss';
import { ChevronLeft } from 'lucide-react'; // Back icon
import { toast } from 'react-toastify';
import { addAddress, updateAddress, AddressDelivery } from '../../../services/addressDelivery/addressApi'; 

const cx = classNames.bind(styles);

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void; // Goes back to the list modal
    onSaveSuccess: (address: AddressDelivery) => void; // Callback after successful save
    initialData?: AddressDelivery | null; // Pass data for editing
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
    isOpen,
    onClose,
    onSaveSuccess,
    initialData
}) => {
    const [formData, setFormData] = useState({ fullName: '', address: '', phoneNumber: '' });
    const [errors, setErrors] = useState({ fullName: '', address: '', phoneNumber: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = Boolean(initialData); // Determine if adding or editing

    // Populate form when initialData changes (for editing)
    useEffect(() => {
        if (isOpen && isEditMode && initialData) {
            setFormData({
                fullName: initialData.fullName,
                address: initialData.address,
                phoneNumber: initialData.phoneNumber
            });
            setErrors({ fullName: '', address: '', phoneNumber: '' }); // Clear errors on open
        } else if (isOpen && !isEditMode) {
            // Reset form for adding new
            setFormData({ fullName: '', address: '', phoneNumber: '' });
            setErrors({ fullName: '', address: '', phoneNumber: '' });
        }
    }, [isOpen, isEditMode, initialData]);

    const validateForm = (): boolean => {
        let isValid = true;
        const newErrors = { fullName: '', address: '', phoneNumber: '' };

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required.';
            isValid = false;
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required.';
            isValid = false;
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required.';
            isValid = false;
        } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.trim())) { // Simple phone validation
            newErrors.phoneNumber = 'Please enter a valid phone number (10-11 digits).';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Optionally clear error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            let savedAddress: AddressDelivery;
            if (isEditMode && initialData) {
                // Call Update API
                savedAddress = await updateAddress(initialData.id, formData);
                toast.success('Address updated successfully!');
            } else {
                // Call Add API
                savedAddress = await addAddress(formData);
                toast.success('Address added successfully!');
            }
            onSaveSuccess(savedAddress); // Pass back the saved/updated address
            // onClose(); // Let the parent decide if it closes or stays open after success

        } catch (error: any) {
            console.error('Failed to save address:', error);
            toast.error(error.message || 'Failed to save address.');
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className={cx('modalOverlay')}> {/* Don't close on overlay click here */}
            <div className={cx('modalContent')}>
                <div className={cx('header')}>
                    <h2 className={cx('title')}>{isEditMode ? 'Update Address' : 'Add New Address'}</h2>
                    <button className={cx('backButton')} onClick={onClose} aria-label="Go Back">
                         <ChevronLeft size={24} /> {/* Back Icon */}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={cx('form')}>
                    <div className={cx('formGroup')}>
                        <label htmlFor="formFullName">Full Name</label>
                        <input
                            type="text"
                            id="formFullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="e.g., John Doe"
                            maxLength={100}
                        />
                         {errors.fullName && <span className={cx('error')}>{errors.fullName}</span>}
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="formAddress">Address</label>
                        <input
                            type="text"
                            id="formAddress"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="e.g., 123 Main St, District 1, HCMC"
                            maxLength={255}
                        />
                         {errors.address && <span className={cx('error')}>{errors.address}</span>}
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="formPhoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="formPhoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., 09xxxxxxx"
                            maxLength={11}
                        />
                         {errors.phoneNumber && <span className={cx('error')}>{errors.phoneNumber}</span>}
                    </div>

                    <div className={cx('footer')}>
                        <button type="button" className={cx('cancelButton')} onClick={onClose} disabled={isSubmitting}>
                            Back
                        </button>
                        <button type="submit" className={cx('submitButton')} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressFormModal;