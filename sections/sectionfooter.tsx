'use client';

import React from "react";
import Link from "next/link";
import { FaLinkedin, FaInstagram } from "react-icons/fa";
import styles from "./sectionfooterstyles.module.css";

export default function SectionFooter() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className={styles.footer}>
      <div className={styles.leftLinks}>
        <button onClick={scrollToTop} className={styles.linkButton}>
          Naar boven
        </button>
        <a href="#Over-mij" className={styles.linkButton}>
          Over mij
        </a>
        <a href="#Projecten" className={styles.linkButton}>
          Projecten
        </a>

        <Link href="/login" className={styles.linkButton}>
          Login
        </Link>
      </div>

      <p className={styles.centerText}>
        © 2025 Mijn portfolio website — Christ Kastelijn
      </p>

      <div className={styles.socials}>
        <a
          href="https://nl.linkedin.com/in/christ-kastelijn-323a12342"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin className={styles.icon} />
        </a>
        <a
          href="https://instagram.com/christ_kastelijn"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram className={styles.icon} />
        </a>
      </div>
    </footer>
  );
}
