import { useState } from 'react';
import axios from 'axios';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ message: '', error: false });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', error: false });

    try {
      const res = await axios.post('/api/contact', formData);
      setStatus({ message: res.data.message, error: false });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({
        message: err.response?.data?.message || 'Failed to send message.',
        error: true,
        errorDetails: err.response?.data?.error || ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <input name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
      <input name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
      <textarea name="message" placeholder="Your Message" value={formData.message} onChange={handleChange} required rows="5" />
      <button type="submit">Send Message</button>
      {status.message && (
        <div className={status.error ? 'error' : 'success'}>
          <p>{status.message.split(' Preview URL:')[0]}</p>
          {!status.error && status.message.includes('Preview URL:') && (
            <p>
              <a href={status.message.split('Preview URL: ')[1]} target="_blank" rel="noopener noreferrer">
                Preview Email
              </a>
            </p>
          )}
          {status.error && status.errorDetails && (
            <small>{status.errorDetails}</small>
          )}
        </div>
      )}
    </form>
  );
};

export default ContactForm;
