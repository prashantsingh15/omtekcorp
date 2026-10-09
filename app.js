// ==========================================================================
// OMTEK CORPORATION - INTERACTIVE LOGIC & FORM HANDLING
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

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
        modalTitle.textContent = `Request Proposal: ${serviceName}`;
      } else {
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

  // 4. Form Submission Handling (Main Enquiry Form)
  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('clientName').value;
      const company = document.getElementById('clientCompany').value;
      const service = document.getElementById('clientService').value;

      alert(`Thank you, ${name} (${company})!\n\nYour enquiry for "${service}" has been received. Our technical team at Omtek Corporation will review your plant requirements and contact you within 24 hours at the provided contact details.`);
      enquiryForm.reset();
    });
  }

  // 5. Modal Form Submission Handling
  const modalForm = document.getElementById('modalForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('mName').value;
      const service = document.getElementById('mService').value;

      alert(`Thank you, ${name}!\n\nYour proposal request for "${service}" has been received. A principal consultant will get in touch promptly.`);
      modalForm.reset();
      closeModal();
    });
  }

  // 6. FAQ Accordion Toggle Handler
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

