import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function ContactPage() {
  // =====================================================
  // FORM STATE
  // =====================================================

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // =====================================================
  // UI STATE
  // =====================================================

  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // CONVEX
  // =====================================================

  const createContact = useMutation(api.contacts.create);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // Basic validation
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.subject) {
      setError("Please select a subject.");
      return;
    }

    if (!form.message.trim()) {
      setError("Please enter your message.");
      return;
    }

    setSubmitting(true);

    try {
      await createContact({
        name: form.name.trim(),

        email: form.email.trim(),

        phone: form.phone.trim() || undefined,

        subject: form.subject,

        message: form.message.trim(),
      });

      // Success screen
      setSubmitted(true);

      // Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact form error:", err);

      setError(
        err?.message || "Unable to send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // SEND ANOTHER MESSAGE
  // =====================================================

  const handleSendAnother = () => {
    setSubmitted(false);
    setError("");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#FAF8F4] text-[#181818]">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="border-b border-[#E7E1D7] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
            Get In Touch
          </p>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <h1 className="font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-8xl">
              We'd love to
              <span className="block italic font-normal">hear from you.</span>
            </h1>

            <p className="max-w-xl text-base leading-8 text-[#777]">
              Have a question about our fragrances, your order, or anything
              else? Send us a message and our team will get back to you.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          CONTACT CONTENT
      ================================================= */}

      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          {/* =================================================
              CONTACT INFO
          ================================================= */}

          <div className="rounded-[28px] bg-[#181818] p-7 text-white sm:p-9 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
              Contact ELYVORR
            </p>

            <h2 className="mt-5 font-serif text-4xl leading-tight">
              Let's start a
              <span className="block italic font-normal text-[#D0AD72]">
                conversation.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-7 text-[#B8B8B8]">
              Whether you need help choosing a fragrance or have a question
              about your order, we're here to help.
            </p>

            <div className="mt-10 space-y-6">
              {/* EMAIL */}

              <div className="flex gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Mail size={19} className="text-[#C9A96E]" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#888]">
                    Email
                  </p>

                  <p className="mt-1 text-sm">support@elyvorr.com</p>
                </div>
              </div>

              {/* PHONE */}

              <div className="flex gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Phone size={19} className="text-[#C9A96E]" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#888]">
                    Phone
                  </p>

                  <p className="mt-1 text-sm">+91 XXXXX XXXXX</p>
                </div>
              </div>

              {/* LOCATION */}

              <div className="flex gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                  <MapPin size={19} className="text-[#C9A96E]" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#888]">
                    Location
                  </p>

                  <p className="mt-1 text-sm">India</p>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-white/10 pt-7">
              <p className="text-xs leading-6 text-[#999]">
                Our customer support team is here to help with product
                questions, orders and general enquiries.
              </p>
            </div>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <div className="rounded-[28px] border border-[#E5DED3] bg-white p-6 shadow-[0_20px_70px_rgba(30,25,20,0.05)] sm:p-9 lg:p-10">
            {submitted ? (
              /* =================================================
                 SUCCESS
              ================================================= */

              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF8EC]">
                  <CheckCircle2 size={32} className="text-[#2F8F46]" />
                </div>

                <p className="mt-7 text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
                  Message Sent
                </p>

                <h2 className="mt-3 font-serif text-4xl font-semibold">
                  Thank you for reaching out.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-[#777]">
                  We've received your message and will get back to you as soon
                  as possible.
                </p>

                <button
                  type="button"
                  onClick={handleSendAnother}
                  className="mt-8 rounded-xl bg-[#181818] px-7 py-4 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                {/* =================================================
                    FORM HEADER
                ================================================= */}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
                    Send A Message
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold">
                    How can we help?
                  </h2>
                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form onSubmit={handleSubmit} className="mt-9 space-y-6">
                  {/* ERROR */}

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                      {error}
                    </div>
                  )}

                  {/* NAME + EMAIL */}

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[2px] text-[#555]">
                        Full Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        placeholder="Your name"
                        className="mt-2 h-12 w-full rounded-xl border border-[#DED7CC] bg-[#FCFBF9] px-4 text-sm outline-none transition focus:border-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[2px] text-[#555]">
                        Email Address
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        placeholder="you@example.com"
                        className="mt-2 h-12 w-full rounded-xl border border-[#DED7CC] bg-[#FCFBF9] px-4 text-sm outline-none transition focus:border-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* PHONE + SUBJECT */}

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[2px] text-[#555]">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        disabled={submitting}
                        placeholder="+91"
                        className="mt-2 h-12 w-full rounded-xl border border-[#DED7CC] bg-[#FCFBF9] px-4 text-sm outline-none transition focus:border-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[2px] text-[#555]">
                        Subject
                      </label>

                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        className="mt-2 h-12 w-full rounded-xl border border-[#DED7CC] bg-[#FCFBF9] px-4 text-sm text-[#555] outline-none transition focus:border-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Select subject</option>

                        <option value="order">Order Enquiry</option>

                        <option value="product">Product Question</option>

                        <option value="return">Return / Exchange</option>

                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* MESSAGE */}

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[2px] text-[#555]">
                      Message
                    </label>

                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      rows={6}
                      placeholder="Tell us how we can help..."
                      className="mt-2 w-full resize-none rounded-xl border border-[#DED7CC] bg-[#FCFBF9] px-4 py-4 text-sm outline-none transition focus:border-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#181818] py-4 text-xs font-semibold uppercase tracking-[2px] text-white transition duration-300 hover:bg-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] leading-5 text-[#999]">
                    We usually respond within 1–2 business days.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;
