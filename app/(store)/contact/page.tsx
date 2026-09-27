'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, CheckCircle2, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Customer Care
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          We’re Here to Help
        </h1>
        <p className="text-sm text-muted-gray">
          Have a question regarding seed cycling routines, tea brewing, or your order dispatch? Reach out to us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Contact Info Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-gray shadow-card space-y-6">
            <h3 className="font-serif font-bold text-xl text-charcoal">Direct Channels</h3>

            <div className="space-y-4">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-950 hover:bg-emerald-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">WhatsApp Helpline</h4>
                  <p className="text-xs text-emerald-800 font-mono mt-0.5">+92 300 1234567</p>
                  <p className="text-[11px] text-emerald-700 mt-1">Instant support for order tracking & bank receipts</p>
                </div>
              </a>

              <div className="p-4 rounded-2xl bg-cream/60 border border-border-gray flex items-start gap-3 text-charcoal">
                <Mail className="w-5 h-5 text-seedly-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Email Support</h4>
                  <p className="text-xs text-muted-gray font-mono mt-0.5">care@seedly.pk</p>
                  <p className="text-[11px] text-muted-gray mt-1">Responses within 12 business hours</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream/60 border border-border-gray flex items-start gap-3 text-charcoal">
                <MapPin className="w-5 h-5 text-seedly-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Apothecary Hubs</h4>
                  <p className="text-xs text-muted-gray mt-0.5">Lahore & Karachi, Pakistan</p>
                  <p className="text-[11px] text-muted-gray mt-1">Daily national dispatch via courier</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-gray text-xs text-muted-gray">
              <strong>Support Hours:</strong> Monday through Saturday, 10:00 AM – 7:00 PM PKT.
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-gray shadow-card">
            <h3 className="font-serif font-bold text-xl text-charcoal mb-6">Send an Inquiry</h3>

            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-2xl text-charcoal">Message Received!</h4>
                <p className="text-sm text-muted-gray max-w-md mx-auto">
                  Thank you, {name}. Our customer care team has received your inquiry and will reach back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-seedly-dark text-white rounded-full text-xs font-semibold"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayesha Khan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ayesha@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="0300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                      Order Number (If applicable)
                    </label>
                    <input
                      type="text"
                      placeholder="SED-20260928-1029"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we assist you with our products or your order?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full text-xs font-semibold transition-all shadow-card flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
