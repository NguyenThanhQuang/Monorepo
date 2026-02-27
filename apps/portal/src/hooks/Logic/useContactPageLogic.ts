import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export function useContactPageLogic() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: call API send contact message
    alert(t('messageSent'));

    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  return {
    t,
    formData,
    handleChange,
    handleSubmit,
  };
}
