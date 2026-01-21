import React, { useState, useContext } from 'react';
import { Eye, EyeOff, Lock, AlertTriangle, Check } from 'lucide-react';
import { Api } from '@/services/service';
import { useRouter } from 'next/router';
import { userContext } from '@/pages/_app';


const PasswordManager = ({ toaster, loader }) => {
    const router = useRouter();
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
   const [user, setUser] = useContext(userContext); // ✅
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Password validation
    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar,
            isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
        };
    };

    const passwordValidation = validatePassword(passwordData.newPassword);
    const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== '';

    const handleInputChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        // Validation
        if (!passwordData.newPassword) {
            toaster({
                type: "error",
                message: "New password is required",
            });
            return;
        }

        if (!passwordData.confirmPassword) {
            toaster({
                type: "error",
                message: "Please confirm your password",
            });
            return;
        }

        if (!passwordValidation.isValid) {
            toaster({
                type: "error",
                message: "Please meet all password requirements",
            });
            return;
        }

        if (!passwordsMatch) {
            toaster({
                type: "error",
                message: "Passwords do not match",
            });
            return;
        }

        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const confirmPasswordChange = async () => {
        setIsLoading(true);
        setShowConfirmModal(false);
        loader(true);
        try {
            const data = {
                password: passwordData.newPassword,
                adminId: user._id
            };

            await Api("post", "changePasswordForAdmin", data, router);

            setPasswordData({
                newPassword: '',
                confirmPassword: ''
            });
            loader(false);
            setSubmitted(false);

            toaster({
                type: "success",
                message: "Password changed successfully",
            });
        } catch (err) {
            toaster({
                type: "error",
                message: err?.message || "Failed to change password"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-8 md:mt-10 mt-4 m-2 px-6">
            <h2 className="text-gray-800 font-bold md:text-3xl text-2xl mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#F38529] rounded mr-3"></span>
                Password Manager
            </h2>

            <section className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-full">
                    <div className="space-y-6">
                        {/* New Password Input */}
                        <div className="relative w-full">
                            <label className="text-gray-700 text-lg font-medium mb-2 block">
                                New Password
                            </label>
                            <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-between items-center">
                                <input
                                    className="outline-none bg-transparent w-full text-gray-700 pr-10"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={passwordData.newPassword}
                                    onCopy={(e) => e.preventDefault()}
                                    onPaste={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {submitted && !passwordData.newPassword && (
                                <p className="text-red-600 mt-1 text-sm">
                                    New password is required
                                </p>
                            )}
                        </div>

                        {/* Password Requirements */}
                        {passwordData.newPassword && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                                <div className="space-y-1">
                                    <div className={`flex items-center text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                                        <Check className={`h-4 w-4 mr-2 ${passwordValidation.minLength ? 'opacity-100' : 'opacity-30'}`} />
                                        At least 8 characters
                                    </div>
                                    <div className={`flex items-center text-sm ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                                        <Check className={`h-4 w-4 mr-2 ${passwordValidation.hasUpperCase ? 'opacity-100' : 'opacity-30'}`} />
                                        One uppercase letter
                                    </div>
                                    <div className={`flex items-center text-sm ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                                        <Check className={`h-4 w-4 mr-2 ${passwordValidation.hasLowerCase ? 'opacity-100' : 'opacity-30'}`} />
                                        One lowercase letter
                                    </div>
                                    <div className={`flex items-center text-sm ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                                        <Check className={`h-4 w-4 mr-2 ${passwordValidation.hasNumbers ? 'opacity-100' : 'opacity-30'}`} />
                                        One number
                                    </div>
                                    <div className={`flex items-center text-sm ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                                        <Check className={`h-4 w-4 mr-2 ${passwordValidation.hasSpecialChar ? 'opacity-100' : 'opacity-30'}`} />
                                        One special character
                                    </div>
                                </div>
                            </div>
                        )}


                        <div className="relative w-full">
                            <label className="text-gray-700 text-lg font-medium mb-2 block">
                                Confirm Password
                            </label>
                            <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-between items-center">
                                <input
                                    className="outline-none bg-transparent w-full text-gray-700 pr-10"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={passwordData.confirmPassword}
                                    onCopy={(e) => e.preventDefault()}
                                    onPaste={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {submitted && !passwordData.confirmPassword && (
                                <p className="text-red-600 mt-1 text-sm">
                                    Please confirm your password
                                </p>
                            )}
                            {passwordData.confirmPassword && !passwordsMatch && (
                                <p className="text-red-600 mt-1 text-sm">
                                    Passwords do not match
                                </p>
                            )}
                            {passwordData.confirmPassword && passwordsMatch && (
                                <p className="text-green-600 mt-1 text-sm">
                                    Passwords match
                                </p>
                            )}
                        </div>

                        {/* Security Note */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Lock className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="text-blue-800 text-sm">
                                    <p className="font-medium mb-1">Security Notice:</p>
                                    <p>Your password will be encrypted and stored securely. Make sure to use a strong, unique password that you don't use anywhere else.</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="text-white bg-[#F38529]  hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-lg text-md font-medium py-2.5 px-6 shadow-sm"
                            >
                                {isLoading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Confirm Password Change
                            </h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to change your password? This action cannot be undone and you'll need to use your new password for future logins.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                className="px-4 cursor-pointer py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 cursor-pointer py-2 bg-[#F38529] text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
                                onClick={confirmPasswordChange}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Changing...' : 'Confirm Change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasswordManager;