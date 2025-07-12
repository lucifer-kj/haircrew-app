"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeInUp } from "@/lib/motion.config";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    // Simulate async subscription
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setEmail("");
    }, 1200);
  };

  const reduced = useReducedMotion();
  const [ref, inView] = useScrollReveal();

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={reduced ? undefined : fadeInUp}
      className="w-full rounded-2xl bg-black text-white shadow-lg p-6 sm:p-8 mb-12 mt-0 max-w-3xl lg:max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 lg:gap-16"
    >
      <div className="flex-1 w-full min-w-0">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#9929EA' }}>Stay Updated,<span className="font-light text-white italic"> Stay Radiant</span></h2>
        <p className="text-white/80 mb-4 max-w-md lg:max-w-xl">Be the first to know about new products, offers, and hair care tips.</p>
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 font-semibold py-2"
            role="status"
            aria-live="polite"
          >
            Thank you for subscribing!
          </motion.div>
        ) : (
          <form className="flex flex-col sm:flex-row gap-3 max-w-md lg:max-w-xl" onSubmit={handleSubmit} aria-label="Newsletter signup form">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your Email"
              className={`rounded-full px-5 py-2 text-white bg-[#181818] border-2 focus:outline-none focus:ring-2 focus:ring-[#9929EA] flex-1 transition-all duration-200 ${error ? 'border-red-500' : 'border-transparent'}`}
              aria-invalid={!!error}
              aria-describedby={error ? 'newsletter-error' : undefined}
              autoComplete="email"
              required
            />
            <motion.button
              type="submit"
              className="bg-[#9929EA] text-white rounded-full px-6 py-2 font-semibold shadow hover:bg-[#7a1fc2] focus:bg-[#7a1fc2] transition-all flex items-center justify-center min-w-[120px]"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <motion.span
                  className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                  aria-label="Loading"
                />
              ) : null}
              {loading ? "Subscribing..." : "Subscribe"}
            </motion.button>
          </form>
        )}
        {error && !success && (
          <motion.div
            id="newsletter-error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 font-medium mt-2"
            role="alert"
          >
            {error}
          </motion.div>
        )}
      </div>
      <motion.div
        className="hidden md:block flex-shrink-0"
        initial={{ scale: 0.95, rotate: -2 }}
        animate={{ scale: [0.95, 1.05, 1], rotate: [ -2, 2, 0 ] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        aria-hidden="true"
      >
        <Image
          src="/Images/banner1.jpg"
          alt="Newsletter"
          width={160}
          height={160}
          className="w-40 h-40 lg:w-60 object-cover mr-5 lg:mr-10 rounded-xl shadow-lg"
          priority
        />
      </motion.div>
    </motion.section>
  );
} 