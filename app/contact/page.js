'use client';

import { useState } from 'react';
import { FaLinkedin, FaResearchgate, FaEnvelope, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle, FaSpinner, FaChartLine } from 'react-icons/fa';
import { SiGooglescholar } from 'react-icons/si';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
    _gotcha: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '', _gotcha: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-20 bg-primary-light dark:bg-primary">
      <div className="container-custom max-w-6xl">
        <div className="page-hero text-center mb-16">
          <ScrollAnimation>
            <h1 className="font-heading text-4xl md:text-5xl text-text-dark dark:text-text mb-4">
              Get in Touch
            </h1>
            <p className="text-text-dark-muted dark:text-text-muted text-lg max-w-2xl mx-auto">
              For academic collaborations, consulting, masterclass enrollment, or media inquiries.
            </p>
          </ScrollAnimation>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Contact Form */}
          <div className="w-full lg:w-3/5">
            <ScrollAnimation delay={0.1}>
              <div className="card-base bg-surface-light dark:bg-surface p-8 md:p-10">
                <h2 className="font-heading text-2xl text-text-dark dark:text-text mb-8">Send a Message</h2>

                {status === 'success' ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center flex flex-col items-center">
                    <FaCheckCircle className="text-4xl text-green-500 mb-4" />
                    <h3 className="font-heading text-xl text-green-800 dark:text-green-400 mb-2">Thank you!</h3>
                    <p className="text-green-700 dark:text-green-300">Your message has been sent successfully. We will get back to you soon.</p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-accent hover:text-accent-hover font-medium underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hidden Honeypot field for bot spam trapping */}
                    <input
                      type="text"
                      name="_gotcha"
                      value={formData._gotcha}
                      onChange={handleChange}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-dark-muted dark:text-text-muted mb-2">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-white dark:bg-primary border border-gray-200 dark:border-accent/10 rounded-xl px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition text-text-dark dark:text-text"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-dark-muted dark:text-text-muted mb-2">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-white dark:bg-primary border border-gray-200 dark:border-accent/10 rounded-xl px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition text-text-dark dark:text-text"
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-text-dark-muted dark:text-text-muted mb-2">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-primary border border-gray-200 dark:border-accent/10 rounded-xl px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition text-text-dark dark:text-text appearance-none"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Masterclass Enrollment">Masterclass Enrollment</option>
                        <option value="Media/Press">Media / Press</option>
                        <option value="Speaking Engagement">Speaking Engagement</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-text-dark-muted dark:text-text-muted mb-2">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-primary border border-gray-200 dark:border-accent/10 rounded-xl px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition resize-none text-text-dark dark:text-text"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>

                    {status === 'error' && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <FaExclamationCircle />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="bg-accent hover:bg-accent/90 text-primary px-8 py-3 rounded-xl font-heading font-medium transition-colors w-full shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {status === 'submitting' ? (
                        <><FaSpinner className="animate-spin" /> Sending...</>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </ScrollAnimation>
          </div>

          {/* Info Panel */}
          <div className="w-full lg:w-2/5 flex flex-col gap-6">
            <ScrollAnimation delay={0.2}>
              <div className="card-base bg-accent/5 dark:bg-accent/10 border-accent/20 p-8 md:p-10 h-full flex flex-col">
                <h3 className="font-heading text-xl text-text-dark dark:text-text mb-6">Contact Information</h3>

                <div className="space-y-6 flex-grow">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-surface-light dark:bg-surface rounded-lg text-accent">
                      <FaMapMarkerAlt size={18} />
                    </div>
                    <div>
                      <h4 className="font-heading font-medium text-text-dark dark:text-text mb-1">Office</h4>
                      <p className="text-text-dark-muted dark:text-text-muted text-sm leading-relaxed">
                        Rustomjee Cambridge International School & Junior College,<br />
                        Mumbai, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-surface-light dark:bg-surface rounded-lg text-accent">
                      <FaEnvelope size={18} />
                    </div>
                    <div>
                      <h4 className="font-heading font-medium text-text-dark dark:text-text mb-1">Email</h4>
                      <a href="mailto:hkanjer@gmail.com" className="text-text-dark-muted dark:text-text-muted text-sm hover:text-accent transition-colors">
                        hkanjer@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="gold-line my-8" />

                <div>
                  <h4 className="font-heading font-medium text-text-dark dark:text-text mb-4">Professional Links</h4>
                  <div className="flex gap-4">
                    <a href="https://www.linkedin.com/in/hanifkanjer" target="_blank" rel="noopener noreferrer" className="p-3 bg-surface-light dark:bg-surface border border-accent/10 rounded-xl text-[#0A66C2] hover:border-accent/30 transition-all shadow-sm hover:shadow-md" title="LinkedIn Profile" aria-label="LinkedIn Profile">
                      <FaLinkedin size={22} />
                    </a>
                    <a href="https://scholar.google.com/citations?user=X8OOo2wAAAAJ&hl=en&oi=ao" target="_blank" rel="noopener noreferrer" className="p-3 bg-surface-light dark:bg-surface border border-accent/10 rounded-xl text-[#4285F4] hover:border-accent/30 transition-all shadow-sm hover:shadow-md" title="Google Scholar" aria-label="Google Scholar">
                      <SiGooglescholar size={22} />
                    </a>
                    <a href="https://www.researchgate.net/profile/Hanif-Kanjer" target="_blank" rel="noopener noreferrer" className="p-3 bg-surface-light dark:bg-surface border border-accent/10 rounded-xl text-[#00CCBB] hover:border-accent/30 transition-all shadow-sm hover:shadow-md" title="ResearchGate" aria-label="ResearchGate">
                      <FaResearchgate size={22} />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="card-base bg-secondary-light dark:bg-secondary p-8 border-l-4 border-l-accent">
                <h4 className="font-heading text-lg text-text-dark dark:text-text mb-2 flex items-center gap-2">
                  <FaChartLine className="text-accent" />
                  Equity Investment Masterclass
                </h4>
                <p className="text-sm text-text-dark-muted dark:text-text-muted">
                  Interested in the Masterclass? Select <strong>'Masterclass Enrollment'</strong> in the form to get details about upcoming batches and registration.
                </p>
              </div>
            </ScrollAnimation>
          </div>

        </div>
      </div>
    </div>
  );
}
