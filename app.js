// ==========================================================================
// OMTEK CORPORATION - INTERACTIVE LOGIC & FORM HANDLING
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

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking any nav-link or CTA
    navMenu.querySelectorAll('.nav-link, .dropdown-link, .mobile-menu-cta-btn').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
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
      if (serviceName && modalServiceSelect) {
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

  // Helper function to save lead to localStorage omtek_enquiries
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
      enquiries = JSON.parse(localStorage.getItem("omtek_enquiries")) || defaultSample;
    } catch (err) {
      enquiries = defaultSample;
    }

    enquiries.unshift(newLead);
    localStorage.setItem("omtek_enquiries", JSON.stringify(enquiries));
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

      alert(`Thank you, ${name} (${company})!\n\nYour enquiry for "${service}" has been received and logged in our Real-Time Portal.\n\nOur technical team at Omtek Corporation will review your plant requirements and contact you within 24 hours at:\n${contactDetail}`);
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

      alert(`Thank you, ${name}!\n\nYour proposal request for "${service}" has been received and saved.\n\nA principal consultant will get in touch promptly at ${contactDetail}.`);
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

      alert(`Thank you, ${name} (${company})!\n\nYour Water & Environmental Audit Request (${service}) has been received.\n\nOur chemical engineering team will contact you at ${contactDetail}.`);
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
});


