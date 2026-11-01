// ==========================================================================
// OMTECH CORPORATION - INTERACTIVE LOGIC & FORM HANDLING
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Scroll Effect
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Menu Toggle & Dropdown Accordion Handling
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('open');
    });

    // Handle dropdown accordion toggles on mobile / touch screens
    const navItems = navMenu.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const dropdown = item.querySelector('.nav-dropdown');
      const navLink = item.querySelector('.nav-link');
      
      if (dropdown && navLink) {
        item.classList.add('has-dropdown');
        navLink.addEventListener('click', (e) => {
          // Whenever mobile drawer is active or screen is mobile/tablet
          if (navMenu.classList.contains('open') || window.innerWidth <= 991) {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = item.classList.contains('dropdown-open');
            navItems.forEach(other => {
              if (other !== item) other.classList.remove('dropdown-open');
            });
            item.classList.toggle('dropdown-open', !isOpen);
          }
        });
      }
    });

    // Close mobile menu when clicking actual destination links
    navMenu.querySelectorAll('.dropdown-link, .mobile-menu-cta-btn').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });

    // Close mobile menu when clicking regular non-dropdown top-level nav links
    navItems.forEach(item => {
      const dropdown = item.querySelector('.nav-dropdown');
      const navLink = item.querySelector('.nav-link');
      if (!dropdown && navLink) {
        navLink.addEventListener('click', () => {
          navMenu.classList.remove('open');
        });
      }
    });

    // Close menu when tapping outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }

  // 3. Modal Popup Logic
  const modal = document.getElementById('enquiryModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');
  const modalServiceSelect = document.getElementById('mService');
  const modalTitle = document.getElementById('modalTitle');

  const openModal = (serviceName = '') => {
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
      if (serviceName && modalServiceSelect) {
        let optionExists = Array.from(modalServiceSelect.options).some(opt => opt.value === serviceName);
        if (!optionExists) {
          const newOpt = new Option(serviceName, serviceName, true, true);
          modalServiceSelect.add(newOpt);
        }
        modalServiceSelect.value = serviceName;
        if (modalTitle) modalTitle.textContent = `Request Proposal: ${serviceName}`;
      } else if (modalTitle) {
        modalTitle.textContent = `Request a Service Proposal`;
      }
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  };

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || '';
      openModal(service);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Elegant in-page confirmation banner
  const showConfirmationNotification = (title, message) => {
    const existing = document.getElementById('omtech-confirmation-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'omtech-confirmation-banner';
    banner.style.cssText = `
      position: fixed;
      top: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: #0f172a;
      color: #ffffff;
      border: 1px solid #c2410c;
      border-left: 6px solid #ea580c;
      padding: 18px 24px;
      border-radius: 10px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.35);
      z-index: 100000;
      max-width: 90%;
      width: 520px;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      gap: 14px;
      align-items: flex-start;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    banner.innerHTML = `
      <div style="background: rgba(194, 65, 12, 0.2); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #ea580c;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div style="flex-grow: 1;">
        <h4 style="margin: 0 0 4px 0; color: #ffffff; font-size: 1.05rem; font-weight: 700;">${title}</h4>
        <p style="margin: 0; color: #cbd5e1; font-size: 0.88rem; line-height: 1.5;">${message}</p>
        <div style="margin-top: 10px; font-size: 0.78rem; color: #94a3b8;">
          Official Inbox: <strong>safehands@omtechcorporation.com</strong> • Direct Review within 24 Hours
        </div>
      </div>
      <button style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 0 4px; line-height: 1;" onclick="this.parentElement.remove()">&times;</button>
    `;

    document.body.appendChild(banner);
    setTimeout(() => {
      banner.style.transform = 'translateX(-50%) translateY(0)';
      banner.style.opacity = '1';
    }, 50);

    setTimeout(() => {
      if (banner.parentElement) {
        banner.style.transform = 'translateX(-50%) translateY(-20px)';
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 350);
      }
    }, 7000);
  };

  // Helper function to save lead to localStorage omtech_enquiries
  const saveEnquiryToStorage = (newLead) => {
    const defaultSample = [
      { id: 1, date: "2026-09-29 14:20", name: "Sanjay Verma", company: "Jamnagar Refinery Operations", contact: "s.verma@refinery.com / +91 98765 43210", service: "HAZOP & PSM Audit", status: "New" },
      { id: 2, date: "2026-09-28 11:45", name: "Rajesh K. Sharma", company: "IOCL Mathura Plant", contact: "rksharma@iocl.in / +91 98111 22334", service: "Asset Integrity Management", status: "Contacted" },
      { id: 3, date: "2026-09-27 16:30", name: "Amitabh Sen", company: "Haldia Petrochemicals", contact: "a.sen@haldia.com / +91 97333 44556", service: "Corporate Industrial Training", status: "In Progress" },
      { id: 4, date: "2026-09-25 09:15", name: "Vikramjit Singh", company: "BHEL Power Sector", contact: "vjsingh@bhel.in / +91 99000 11223", service: "QA/QC Vendor Audit", status: "Completed" },
      { id: 5, date: "2026-09-24 18:00", name: "Tariq Al-Mansoor", company: "GCC EPC Contracting", contact: "tariq@gulfepc.com / +965 9912 3456", service: "Process Safety Consulting", status: "New" }
    ];

    let enquiries = [];
    try {
      enquiries = JSON.parse(localStorage.getItem("omtech_enquiries")) || JSON.parse(localStorage.getItem("omtek_enquiries")) || defaultSample;
    } catch (err) {
      enquiries = defaultSample;
    }

    enquiries.unshift(newLead);
    localStorage.setItem("omtech_enquiries", JSON.stringify(enquiries));
    window.dispatchEvent(new Event('storage'));
  };

  // Helper to format date & time
  const getFormattedDateTime = () => {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}`;
  };

  // Helper to dispatch email to official inbox safehands@omtechcorporation.com
  const dispatchEnquiryToBackend = (payload) => {
    // 1. Attempt PHP backend endpoint on server
    try {
      fetch('send-enquiry.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}

    // 2. Serverless email relay to safehands@omtechcorporation.com
    try {
      fetch('https://formsubmit.co/ajax/safehands@omtechcorporation.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Website Proposal: ${payload.service} — ${payload.company}`,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          company: payload.company,
          service: payload.service,
          message: payload.message || 'Direct inquiry from website'
        })
      }).catch(() => {});
    } catch (e) {}
  };

  // 4. Form Submission Handling (Main Enquiry Form)
  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('clientName')?.value.trim() || 'Anonymous Client';
      const email = document.getElementById('clientEmail')?.value.trim() || '';
      const phone = document.getElementById('clientPhone')?.value.trim() || '';
      const company = document.getElementById('clientCompany')?.value.trim() || 'Not Specified';
      const service = document.getElementById('clientService')?.value || 'General Technical Advisory';
      const message = document.getElementById('clientMessage')?.value.trim() || '';

      const contactDetail = [email, phone].filter(Boolean).join(' / ') || 'Direct Website Submission';

      const leadData = {
        id: Date.now(),
        date: getFormattedDateTime(),
        name: name,
        company: company,
        contact: contactDetail + (message ? ` (Note: ${message})` : ''),
        service: service,
        status: "New"
      };

      saveEnquiryToStorage(leadData);
      dispatchEnquiryToBackend({ name, email, phone, company, service, message });

      showConfirmationNotification(
        "Proposal Request Received",
        `Thank you, ${name} (${company}). Your request for "${service}" has been received and saved. Our principal consultants will review your scope and get in touch at ${contactDetail}.`
      );
      enquiryForm.reset();
    });
  }

  // 5. Modal Form Submission Handling
  const modalForm = document.getElementById('modalForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('mName')?.value.trim() || 'Client';
      const email = document.getElementById('mEmail')?.value.trim() || '';
      const phone = document.getElementById('mPhone')?.value.trim() || '';
      const service = document.getElementById('mService')?.value || 'Proposal Request';
      const notes = document.getElementById('mNotes')?.value.trim() || '';

      const contactDetail = [email, phone].filter(Boolean).join(' / ') || 'Modal Submission';

      const leadData = {
        id: Date.now(),
        date: getFormattedDateTime(),
        name: name,
        company: "Modal Lead",
        contact: contactDetail + (notes ? ` (Details: ${notes})` : ''),
        service: service,
        status: "New"
      };

      saveEnquiryToStorage(leadData);
      dispatchEnquiryToBackend({ name, email, phone, company: 'Modal Lead', service, message: notes });

      showConfirmationNotification(
        "Proposal Request Saved",
        `Thank you, ${name}. Your proposal request for "${service}" has been logged. A principal consultant will contact you promptly at ${contactDetail}.`
      );
      modalForm.reset();
      closeModal();
    });
  }

  // 6. Inline Water Page / Page Specific Form Handler (if present)
  const waterForm = document.getElementById('waterForm');
  if (waterForm) {
    waterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('wName')?.value.trim() || 'Water Client';
      const email = document.getElementById('wEmail')?.value.trim() || '';
      const phone = document.getElementById('wPhone')?.value.trim() || '';
      const company = document.getElementById('wCompany')?.value.trim() || 'Plant Operator';
      const service = document.getElementById('wSystem')?.value || 'Water & Environmental Solutions';
      const capacity = document.getElementById('wCapacity')?.value.trim() || '';

      const contactDetail = [email, phone].filter(Boolean).join(' / ') || 'Water Audit Form';

      const leadData = {
        id: Date.now(),
        date: getFormattedDateTime(),
        name: name,
        company: company,
        contact: contactDetail + (capacity ? ` (Flow Capacity: ${capacity})` : ''),
        service: service,
        status: "New"
      };

      saveEnquiryToStorage(leadData);

      showConfirmationNotification(
        "Water & Environmental Request Received",
        `Thank you, ${name} (${company}). Your Water & Infrastructure request (${service}) has been received. Our engineering team will contact you at ${contactDetail}.`
      );
      waterForm.reset();
    });
  }

  // 7. FAQ Accordion Toggle Handler
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isExpanded = item.classList.contains('active');

      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const a = i.querySelector('.faq-answer');
        if (a) a.style.display = 'none';
      });

      if (!isExpanded && answer) {
        item.classList.add('active');
        answer.style.display = 'block';
      }
    });
  });

  // Hide all FAQ answers initially except when active
  document.querySelectorAll('.faq-item:not(.active) .faq-answer').forEach(a => {
    a.style.display = 'none';
  });

  // 8. Corporate Training Category Filter
  const filterBtns = document.querySelectorAll('.training-filter-btn');
  const programmeCards = document.querySelectorAll('.programme-card');
  if (filterBtns.length > 0 && programmeCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter') || 'all';
        
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        programmeCards.forEach(card => {
          const cardCat = card.getAttribute('data-category') || '';
          if (filter === 'all' || cardCat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
});


