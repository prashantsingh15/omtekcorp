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
      if (dropdown) {
        const navLink = item.querySelector('.nav-link');
        if (navLink) {
          navLink.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
              e.preventDefault();
              item.classList.toggle('dropdown-active');
            }
          });
        }
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }

  // 3. Modal Popup Handling
  const modal = document.getElementById('enquiryModal');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');
  const closeModalBtn = document.getElementById('modalCloseBtn');
  const modalServiceSelect = document.getElementById('mService');

  const openModal = (serviceName = '') => {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (serviceName && modalServiceSelect) {
      modalServiceSelect.value = serviceName;
    }
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (openModalBtns.length > 0) {
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const service = btn.getAttribute('data-service') || '';
        openModal(service);
      });
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Generate unique business reference number
  const generateReferenceId = () => {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `OTC-${YYYY}${MM}-${random}`;
  };

  // High-visibility in-page confirmation and direct dispatch dialog
  const showConfirmationNotification = (title, message, redirectInfo, isError = false) => {
    const existing = document.getElementById('omtech-confirmation-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'omtech-confirmation-banner';
    banner.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: #0f172a;
      color: #ffffff;
      border: 1px solid ${isError ? '#ef4444' : '#ea580c'};
      border-left: 6px solid ${isError ? '#ef4444' : '#f97316'};
      padding: 22px 26px;
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.55);
      z-index: 9999999;
      max-width: 94%;
      width: 580px;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 14px;
      font-family: system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
    `;

    const redirectButtons = redirectInfo ? `
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 14px; margin-top: 4px;">
        <span style="font-size: 0.76rem; font-weight: 700; color: #fb923c; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Direct Transmission Options (Zero Wait)</span>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=omtechcorp2402@gmail.com&cc=safehands@omtechcorporation.com,kkamleshmishra2@gmail.com&su=${encodeURIComponent(redirectInfo.subject)}&body=${encodeURIComponent(redirectInfo.body)}" target="_blank" rel="noopener noreferrer" style="background: #ea580c; color: #ffffff; padding: 9px 16px; border-radius: 6px; font-weight: 700; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(234,88,12,0.35);">✉️ Open in Gmail</a>
          <a href="https://wa.me/919810772284?text=${encodeURIComponent(redirectInfo.waText)}" target="_blank" rel="noopener noreferrer" style="background: #16a34a; color: #ffffff; padding: 9px 16px; border-radius: 6px; font-weight: 700; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(22,163,74,0.35);">💬 Send on WhatsApp</a>
          <a href="mailto:omtechcorp2402@gmail.com,safehands@omtechcorporation.com?cc=kkamleshmishra2@gmail.com&subject=${encodeURIComponent(redirectInfo.subject)}&body=${encodeURIComponent(redirectInfo.body)}" style="background: #334155; color: #ffffff; padding: 9px 14px; border-radius: 6px; font-weight: 600; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">📬 Default Mail App</a>
        </div>
      </div>
    ` : '';

    const iconHtml = isError 
      ? `<div style="background: rgba(239, 68, 68, 0.2); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #ef4444; font-size: 20px;">⚠️</div>`
      : `<div style="background: rgba(234, 88, 12, 0.2); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #f97316;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>`;

    banner.innerHTML = `
      <div style="display: flex; gap: 14px; align-items: flex-start;">
        ${iconHtml}
        <div style="flex-grow: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; color: #ffffff; font-size: 1.1rem; font-weight: 700;">${title}</h4>
            <button style="background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; padding: 0 4px; line-height: 1;" onclick="this.closest('#omtech-confirmation-banner').remove()">&times;</button>
          </div>
          <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">${message}</p>
          <div id="omtech-dispatch-status" style="font-size: 0.82rem; color: ${isError ? '#f87171' : '#f59e0b'}; margin-top: 6px; font-weight: 600;">
            ${isError ? 'Notice: Form details retained below. Direct email/chat buttons ready.' : '⏳ Verified transmission in progress...'}
          </div>
        </div>
      </div>
      ${redirectButtons}
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
        <span>Direct Inboxes: <strong style="color: #f1f5f9;">omtechcorp2402@gmail.com</strong> | <strong style="color: #f1f5f9;">safehands@omtechcorporation.com</strong></span>
        <button type="button" onclick="this.closest('#omtech-confirmation-banner').remove()" style="background: none; border: 1px solid #475569; color: #cbd5e1; padding: 4px 10px; border-radius: 4px; font-size: 0.76rem; cursor: pointer;">Dismiss ✕</button>
      </div>
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
        setTimeout(() => banner.remove(), 20000);
      }
    }, 20000);
  };

  // Helper function to save lead to localStorage omtech_enquiries
  const saveEnquiryToStorage = (newLead) => {
    const defaultSample = [
      { id: 'OTC-202609-1001', date: '2026-09-29 14:20', name: 'Sanjay Verma', company: 'Jamnagar Refinery Operations', contact: 's.verma@refinery.com / +91 98765 43210', service: 'HAZOP & PSM Audit', status: 'New' },
      { id: 'OTC-202609-1002', date: '2026-09-28 11:45', name: 'Rajesh K. Sharma', company: 'IOCL Mathura Plant', contact: 'rksharma@iocl.in / +91 98111 22334', service: 'Asset Integrity Management', status: 'Contacted' },
      { id: 'OTC-202609-1003', date: '2026-09-27 16:30', name: 'Amitabh Sen', company: 'Haldia Petrochemicals', contact: 'a.sen@haldia.com / +91 97333 44556', service: 'Corporate Industrial Training', status: 'In Progress' },
      { id: 'OTC-202609-1004', date: '2026-09-25 09:15', name: 'Vikramjit Singh', company: 'BHEL Power Sector', contact: 'vjsingh@bhel.in / +91 99000 11223', service: 'QA/QC Vendor Audit', status: 'Completed' }
    ];

    let enquiries = [];
    try {
      enquiries = JSON.parse(localStorage.getItem('omtech_enquiries')) || JSON.parse(localStorage.getItem('omtek_enquiries')) || defaultSample;
    } catch (err) {
      enquiries = defaultSample;
    }

    enquiries.unshift(newLead);
    localStorage.setItem('omtech_enquiries', JSON.stringify(enquiries));
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

  // Helper to dispatch email to official inbox and return Promise
  const dispatchEnquiryToBackend = async (payload) => {
    // 1. Attempt PHP backend endpoint on server
    try {
      fetch('send-enquiry.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}

    const clientOrg = (payload.company && payload.company !== 'Direct Engagement' && payload.company !== 'Modal Lead' && payload.company !== 'Not Specified') 
      ? payload.company 
      : '';
    const refCode = payload.refId || 'OTC-DIRECT';
    const subjectLine = clientOrg 
      ? `⚡ [Omtech Proposal ${refCode}] ${payload.service} — ${clientOrg}`
      : `⚡ [Omtech Proposal ${refCode}] ${payload.service} — ${payload.name}`;

    const formSubmitPayload = {
      _subject: subjectLine,
      _template: 'table',
      _captcha: 'false',
      _cc: 'safehands@omtechcorporation.com,kkamleshmishra2@gmail.com',
      'Reference ID': refCode,
      'Client Name': payload.name,
      'Company / Plant': clientOrg || 'Direct Engagement',
      'Contact Phone': payload.phone || 'Not Provided',
      'Email Address': payload.email || 'Not Provided',
      'Requested Service': payload.service,
      'Participant Level': payload.participantLevel || 'Not Specified',
      'Approx Batch Size': payload.batchSize || 'Not Specified',
      'Preferred Timeline': payload.preferredDates || 'Flexible',
      'Delivery Mode': payload.deliveryMode || 'Onsite / Hybrid',
      'Project Scope & Details': payload.message || 'Direct proposal intake through website'
    };
    if (payload.email) {
      formSubmitPayload._replyto = payload.email;
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/omtechcorp2402@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formSubmitPayload)
      });
      const data = await response.json();
      return { success: (data && (data.success === 'true' || data.success === true)), data };
    } catch (err) {
      console.warn('FormSubmit fetch error:', err);
      return { success: false, error: err };
    }
  };

  // 4. Form Submission Handling (Main Enquiry Form)
  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm) {
    let isSubmitting = false;

    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic Spam Honeypot Check
      const honeypot = enquiryForm.querySelector('input[name="_website_hp"], input[name="_gotcha"]');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn('Spam submission suppressed.');
        enquiryForm.reset();
        return;
      }

      if (isSubmitting) return; // Duplicate submission prevention
      isSubmitting = true;

      const submitBtn = enquiryForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Proposal Request';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ Transmitting Proposal...';
        submitBtn.style.opacity = '0.75';
      }

      const name = document.getElementById('clientName')?.value.trim() || 'Prospective Client';
      const email = document.getElementById('clientEmail')?.value.trim() || '';
      const phone = document.getElementById('clientPhone')?.value.trim() || '';
      const rawCompany = document.getElementById('clientCompany')?.value.trim() || '';
      const company = rawCompany || 'Direct Engagement';
      const service = document.getElementById('clientService')?.value || 'Technical & HSE Advisory';
      const message = document.getElementById('clientMessage')?.value.trim() || '';

      // Training specific optional fields
      const participantLevel = document.getElementById('participantLevel')?.value || 'Not Specified';
      const batchSize = document.getElementById('batchSize')?.value.trim() || 'Not Specified';
      const preferredDates = document.getElementById('preferredDates')?.value.trim() || 'Flexible';
      const deliveryMode = document.getElementById('deliveryMode')?.value || 'Onsite / Hybrid';

      const contactDetail = [email, phone].filter(Boolean).join(' | ');
      const refId = generateReferenceId();

      const leadData = {
        id: refId,
        date: getFormattedDateTime(),
        name: name,
        company: company,
        contact: contactDetail,
        phone: phone,
        email: email,
        service: service,
        participantLevel: participantLevel,
        batchSize: batchSize,
        preferredDates: preferredDates,
        deliveryMode: deliveryMode,
        message: message,
        notes: message,
        status: 'New'
      };

      const companyNote = rawCompany ? ` (${rawCompany})` : '';
      const redirectInfo = {
        subject: `⚡ [Omtech Proposal ${refId}] ${service} — ${name}${companyNote}`,
        body: `Hello Omtech Corporation Team,\n\nI have submitted a proposal request on your website (Ref: ${refId}).\n\nService Required: ${service}\nClient Name: ${name}\nCompany: ${company}\nContact Details: ${contactDetail}\nParticipant Level: ${participantLevel}\nBatch Size: ${batchSize}\nPreferred Timeline: ${preferredDates}\nDelivery Mode: ${deliveryMode}\nScope & Requirements:\n${message || 'Direct consultation and proposal request'}\n\nPlease review and connect promptly.\n\nRegards,\n${name}`,
        waText: `Hello Omtech Corporation, I submitted proposal request ${refId} for "${service}". Name: ${name}, Contact: ${contactDetail}.`
      };

      try {
        const result = await dispatchEnquiryToBackend({ 
          refId, name, email, phone, company, service, 
          participantLevel, batchSize, preferredDates, deliveryMode, 
          message 
        });

        // Always save lead locally
        saveEnquiryToStorage(leadData);

        if (result.success) {
          showConfirmationNotification(
            `Proposal Request Accepted (Ref: ${refId})`,
            `Thank you, ${name}${companyNote}. Your technical inquiry for "${service}" has been successfully delivered to our advisory team. Reference ID: <strong>${refId}</strong>. We will review your plant context and respond promptly at ${contactDetail}.`,
            redirectInfo,
            false
          );
          const statusEl = document.getElementById('omtech-dispatch-status');
          if (statusEl) {
            statusEl.innerHTML = `✅ <span style="color: #4ade80;">Dispatched to omtechcorp2402@gmail.com with CC to safehands!</span>`;
          }
          enquiryForm.reset();
        } else {
          // Failure with input details retained!
          showConfirmationNotification(
            `Proposal Registered (Ref: ${refId})`,
            `Thank you, ${name}. Your request is registered under Ref: <strong>${refId}</strong>. Network dispatch is pending. All your entered details are safely preserved below. Please click "Open in Gmail" or "Send on WhatsApp" for instant delivery.`,
            redirectInfo,
            true
          );
        }
      } catch (err) {
        saveEnquiryToStorage(leadData);
        showConfirmationNotification(
          `Proposal Registered (Ref: ${refId})`,
          `Thank you, ${name}. Your request is registered under Ref: <strong>${refId}</strong>. Your details have been retained below. Please use the instant Gmail or WhatsApp buttons to transmit.`,
          redirectInfo,
          true
        );
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
          submitBtn.style.opacity = '1';
        }
      }
    });
  }

  // 5. Modal Form Submission Handling
  const modalForm = document.getElementById('modalForm');
  if (modalForm) {
    let isModalSubmitting = false;

    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot check
      const honeypot = modalForm.querySelector('input[name="_website_hp"], input[name="_gotcha"]');
      if (honeypot && honeypot.value.trim() !== '') {
        modalForm.reset();
        closeModal();
        return;
      }

      if (isModalSubmitting) return;
      isModalSubmitting = true;

      const submitBtn = modalForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Request';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ Transmitting...';
        submitBtn.style.opacity = '0.75';
      }

      const name = document.getElementById('mName')?.value.trim() || 'Prospective Client';
      const email = document.getElementById('mEmail')?.value.trim() || '';
      const phone = document.getElementById('mPhone')?.value.trim() || '';
      const service = document.getElementById('mService')?.value || 'Technical & HSE Advisory';
      const notes = document.getElementById('mNotes')?.value.trim() || '';

      const participantLevel = document.getElementById('mParticipantLevel')?.value || '';
      const batchSize = document.getElementById('mBatchSize')?.value.trim() || '';

      const contactDetail = [email, phone].filter(Boolean).join(' | ');
      const refId = generateReferenceId();

      const leadData = {
        id: refId,
        date: getFormattedDateTime(),
        name: name,
        company: 'Direct Engagement',
        contact: contactDetail,
        phone: phone,
        email: email,
        service: service,
        participantLevel: participantLevel,
        batchSize: batchSize,
        message: notes,
        notes: notes,
        status: 'New'
      };

      const redirectInfo = {
        subject: `⚡ [Omtech Proposal ${refId}] ${service} — ${name}`,
        body: `Hello Omtech Corporation Team,\n\nI have requested a proposal via the website (Ref: ${refId}).\n\nService: ${service}\nClient Name: ${name}\nContact Details: ${contactDetail}\n${participantLevel ? 'Participant Level: ' + participantLevel + '\n' : ''}${batchSize ? 'Approx Batch Size: ' + batchSize + '\n' : ''}Project Notes / Scope:\n${notes || 'Direct proposal intake'}\n\nRegards,\n${name}`,
        waText: `Hello Omtech Corporation, I submitted proposal request ${refId} for "${service}". Name: ${name}, Contact: ${contactDetail}.`
      };

      try {
        const result = await dispatchEnquiryToBackend({ 
          refId, name, email, phone, company: 'Direct Engagement', 
          service, participantLevel, batchSize, message: notes 
        });

        saveEnquiryToStorage(leadData);

        if (result.success) {
          showConfirmationNotification(
            `Proposal Request Accepted (Ref: ${refId})`,
            `Thank you, ${name}. Your proposal request for "${service}" (Ref: <strong>${refId}</strong>) has been confirmed. Our team will review your requirements and connect with you shortly at ${contactDetail}.`,
            redirectInfo,
            false
          );
          const statusEl = document.getElementById('omtech-dispatch-status');
          if (statusEl) {
            statusEl.innerHTML = `✅ <span style="color: #4ade80;">Dispatched to omtechcorp2402@gmail.com with CC to safehands!</span>`;
          }
          modalForm.reset();
          closeModal();
        } else {
          showConfirmationNotification(
            `Proposal Registered (Ref: ${refId})`,
            `Thank you, ${name}. Your request is registered under Ref: <strong>${refId}</strong>. Entered details are preserved. You can click Gmail or WhatsApp below for instant copy.`,
            redirectInfo,
            true
          );
        }
      } catch (err) {
        saveEnquiryToStorage(leadData);
        showConfirmationNotification(
          `Proposal Registered (Ref: ${refId})`,
          `Thank you, ${name}. Your request is registered under Ref: <strong>${refId}</strong>. You can click Gmail or WhatsApp below for instant copy.`,
          redirectInfo,
          true
        );
      } finally {
        isModalSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
          submitBtn.style.opacity = '1';
        }
      }
    });
  }

  // 6. Inline Water Page / Page Specific Form Handler (if present)
  const waterForm = document.getElementById('waterForm') || document.getElementById('waterProposalForm');
  if (waterForm) {
    let isWaterSubmitting = false;

    waterForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (isWaterSubmitting) return;
      isWaterSubmitting = true;

      const submitBtn = waterForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Water Inquiry';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ Transmitting...';
      }

      const name = document.getElementById('wName')?.value.trim() || 'Prospective Client';
      const email = document.getElementById('wEmail')?.value.trim() || '';
      const phone = document.getElementById('wPhone')?.value.trim() || '';
      const rawCompany = document.getElementById('wCompany')?.value.trim() || '';
      const company = rawCompany || 'Industrial Facility';
      const service = document.getElementById('wSystem')?.value || 'Water & Environmental Solutions';
      const capacity = document.getElementById('wCapacity')?.value.trim() || '';

      const contactDetail = [email, phone].filter(Boolean).join(' | ');
      const messageNotes = capacity ? `Flow / Treatment Capacity: ${capacity}` : '';
      const refId = generateReferenceId();

      const leadData = {
        id: refId,
        date: getFormattedDateTime(),
        name: name,
        company: company,
        contact: contactDetail,
        phone: phone,
        email: email,
        service: service,
        message: messageNotes,
        notes: messageNotes,
        status: 'New'
      };

      const companyNote = rawCompany ? ` (${rawCompany})` : '';
      const redirectInfo = {
        subject: `⚡ [Omtech Proposal ${refId}] Water Solutions — ${name}${companyNote}`,
        body: `Hello Omtech Corporation Team,\n\nI submitted an inquiry for Water & Environmental Solutions (Ref: ${refId}).\n\nClient Name: ${name}\nCompany: ${company}\nContact: ${contactDetail}\nSpecifications: ${messageNotes || 'Bulk drinking / industrial treatment'}\n\nRegards,\n${name}`,
        waText: `Hello Omtech Corporation, I submitted an inquiry for Water Solutions (${refId}). Name: ${name}, Contact: ${contactDetail}.`
      };

      try {
        const result = await dispatchEnquiryToBackend({ 
          refId, name, email, phone, company, service, message: messageNotes 
        });

        saveEnquiryToStorage(leadData);

        if (result.success) {
          showConfirmationNotification(
            `Water & Environmental Request Accepted (Ref: ${refId})`,
            `Thank you, ${name}${companyNote}. Your inquiry for "${service}" has been received. Our water engineering team will contact you at ${contactDetail}.`,
            redirectInfo,
            false
          );
          waterForm.reset();
        } else {
          showConfirmationNotification(
            `Request Registered (Ref: ${refId})`,
            `Thank you, ${name}. Your request is registered under Ref: <strong>${refId}</strong>. Entered details are preserved below. Please click Gmail or WhatsApp to transmit directly.`,
            redirectInfo,
            true
          );
        }
      } catch (err) {
        saveEnquiryToStorage(leadData);
        showConfirmationNotification(
          `Request Registered (Ref: ${refId})`,
          `Thank you, ${name}. Your request is registered under Ref: <strong>${refId}</strong>. Please use Gmail or WhatsApp buttons to complete.`,
          redirectInfo,
          true
        );
      } finally {
        isWaterSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
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

  // 8. Corporate Training Pathways Filter & Live Search
  const filterBtns = document.querySelectorAll('.training-filter-btn');
  const programmeCards = document.querySelectorAll('.programme-card');
  const searchInput = document.getElementById('trainingSearchInput');

  let currentFilter = 'all';
  let currentSearch = '';

  const filterProgrammes = () => {
    programmeCards.forEach(card => {
      const cardPathway = card.getAttribute('data-pathway') || '';
      const cardCategory = card.getAttribute('data-category') || '';
      const cardText = card.textContent.toLowerCase();

      const matchesPathway = (currentFilter === 'all') || 
                             cardPathway.includes(currentFilter) || 
                             cardCategory.includes(currentFilter);

      const matchesSearch = !currentSearch || cardText.includes(currentSearch);

      if (matchesPathway && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  if (filterBtns.length > 0 && programmeCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-pathway') || btn.getAttribute('data-filter') || 'all';
        
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterProgrammes();
      });
    });
  }

  if (searchInput && programmeCards.length > 0) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      filterProgrammes();
    });
  }
});
