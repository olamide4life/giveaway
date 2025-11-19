// =========================
// FULL win.js (fixed social username + image preview init timing)
// =========================

document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // ELEMENT SELECTORS
  // =========================
  const form = document.getElementById('giveawayForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');

  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const imageUploadArea = document.getElementById('imageUploadArea');

  const termsModal = document.getElementById('termsModal');
  const termsLink = document.getElementById('termsLink');
  const closeModal = document.getElementById('closeModal');
  const agreeTerms = document.getElementById('agreeTerms');
  const termsCheckbox = document.getElementById('terms');

  // popup note elements (exist in your HTML)
  const notePopup = document.getElementById('notePopup');
  const closeNote = document.getElementById('closeNote');

  // social elements (match your HTML names)
  const socialPlatform = document.getElementById('socialPlatform');
  const socialUsername = document.getElementById('socialUsername');
  const socialUsernameSection = document.getElementById('socialUsernameSection');

  // =========================
  // CLOUDINARY CONFIG
  // =========================
  const CLOUD_NAME = "dlvmuzhu0";
  const UPLOAD_PRESET = "giveaway";

  let selectedImages = [];
  let uploadedImageURLs = [];

  // =========================
  // ERROR HANDLER
  // =========================
  function showError(id, show = true, text = null) {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.display = show ? "block" : "none";
      if (text) el.textContent = text;
  }

  // =========================
  // IMAGE SELECT + PREVIEW
  // =========================
  // attach click to fake upload area
  if (imageUploadArea && imageInput) {
    imageUploadArea.addEventListener("click", () => imageInput.click());
  }

  if (imageInput) {
    imageInput.addEventListener("change", e => {
        const files = Array.from(e.target.files || []);

        if (selectedImages.length + files.length > 3) {
            showError("imageError", true, "Maximum 3 images allowed");
            return;
        }

        showError("imageError", false);

        files.forEach(file => {
            if (file.type && file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = ev => {
                    selectedImages.push({ file, dataUrl: ev.target.result });
                    renderPreviews();
                };
                reader.readAsDataURL(file);
            }
        });

        // reset so same file can be reselected if removed
        imageInput.value = "";
    });
  }

  function renderPreviews() {
      if (!imagePreview) return;
      imagePreview.innerHTML = "";

      selectedImages.forEach((img, index) => {
          const div = document.createElement("div");
          div.classList.add("preview-item");

          div.innerHTML = `
              <img src="${img.dataUrl}" alt="preview ${index+1}">
              <button type="button" class="remove-image" data-index="${index}">×</button>
          `;

          imagePreview.appendChild(div);
      });

      // attach remove handlers
      document.querySelectorAll(".remove-image").forEach(btn => {
          btn.addEventListener("click", e => {
              const i = parseInt(e.currentTarget.getAttribute("data-index"), 10);
              if (!isNaN(i)) {
                  selectedImages.splice(i, 1);
                  renderPreviews();
              }
          });
      });
  }

  // =========================
  // TERMS MODAL
  // =========================
  if (termsLink) {
    termsLink.addEventListener("click", e => {
        e.preventDefault();
        if (termsModal) termsModal.classList.add("show");
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
        if (termsModal) termsModal.classList.remove("show");
    });
  }

  if (agreeTerms) {
    agreeTerms.addEventListener("click", () => {
        if (termsCheckbox) termsCheckbox.checked = true;
        if (termsModal) termsModal.classList.remove("show");
        showError("termsError", false);
    });
  }

  if (termsModal) {
    termsModal.addEventListener("click", e => {
        if (e.target === termsModal) termsModal.classList.remove("show");
    });
  }

  // =========================
  // POPUP NOTE (X close + outside click)
  // =========================
  if (closeNote && notePopup) {
    closeNote.addEventListener("click", () => {
      notePopup.style.display = "none";
    });

    notePopup.addEventListener("click", (e) => {
      if (e.target === notePopup) notePopup.style.display = "none";
    });
  }

  // optional: show popup initially if present
  if (notePopup) notePopup.style.display = 'flex';

  // =========================
  // SOCIAL USERNAME SHOW/HIDE (FIX)
  // =========================
  // Start hidden
  if (socialUsernameSection) socialUsernameSection.style.display = 'none';

  if (socialPlatform) {
    socialPlatform.addEventListener('change', () => {
      const val = (socialPlatform.value || "").trim();
      if (val !== "") {
        if (socialUsernameSection) socialUsernameSection.style.display = 'block';
        if (socialUsername) socialUsername.focus();
      } else {
        if (socialUsernameSection) socialUsernameSection.style.display = 'none';
        if (socialUsername) socialUsername.value = '';
      }
    });
  }

  // =========================
  // FORM VALIDATION
  // =========================
  function validateForm() {
      let valid = true;

      const fullName = document.getElementById("fullName").value.trim();
      if (fullName.length < 2) { showError("nameError"); valid = false; } else showError("nameError", false);

      const email = document.getElementById("email").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showError("emailError"); valid = false;
      } else showError("emailError", false);

      const phone = document.getElementById("phoneNumber").value.trim();
      if (phone.replace(/\D/g, "").length < 7) {
          showError("phoneError", true, "Enter valid phone number");
          valid = false;
      } else showError("phoneError", false);

      // social platform + username checks
      const platformVal = (socialPlatform && socialPlatform.value) ? socialPlatform.value.trim() : "";
      const usernameVal = (socialUsername && socialUsername.value) ? socialUsername.value.trim() : "";

      if (!platformVal) {
          showError("socialPlatformError", true, "Select a platform");
          valid = false;
      } else {
          showError("socialPlatformError", false);
      }

      if (!usernameVal) {
          showError("socialUsernameError", true, "Enter your username");
          valid = false;
      } else {
          showError("socialUsernameError", false);
      }

      if (!termsCheckbox || !termsCheckbox.checked) {
          showError("termsError", true, "You must accept the terms");
          valid = false;
      } else showError("termsError", false);

      return valid;
  }

  // =========================
  // CLOUDINARY UPLOAD
  // =========================
  async function uploadImageToCloudinary(file) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
          method: "POST",
          body: data
      });

      if (!res.ok) throw new Error("Cloudinary upload failed");

      const json = await res.json();
      return json.secure_url;
  }

  // =========================
  // SUBMIT FORM
  // =========================
  if (form) {
    form.addEventListener("submit", async e => {
        e.preventDefault();

        if (!validateForm()) return;

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Submitting...";
        }

        uploadedImageURLs = [];

        try {
            for (const img of selectedImages) {
                const url = await uploadImageToCloudinary(img.file);
                uploadedImageURLs.push(url);
            }

            const data = new FormData(form);

            // append image urls
            uploadedImageURLs.forEach((url, i) => data.append(`image${i+1}_url`, url));

            const response = await fetch("https://formspree.io/f/xpwjppkr", {
                method: "POST",
                body: data,
                headers: { "Accept": "application/json" }
            });

            if (!response.ok) throw new Error("Failed to submit form");

            form.style.display = "none";
            if (successMessage) successMessage.classList.add("show");

        } catch (err) {
            alert(err.message || "Error submitting the form");
        } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Enter Giveaway";
            }
        }
    });
  }

  // =========================
  // small celebrate shake (if you have .celebrate in popup)
  // =========================
  const celebrate = document.querySelector('.note-content .celebrate');
  if (celebrate) {
    function triggerShake() {
      celebrate.classList.remove('animate');
      void celebrate.offsetWidth;
      celebrate.classList.add('animate');
      setTimeout(() => celebrate.classList.remove('animate'), 1000);
    }
    triggerShake();
    const shakeInterval = setInterval(() => {
      if (!notePopup || notePopup.style.display === 'none') return;
      triggerShake();
    }, 5000);
    // clear when popup closed
    if (closeNote) closeNote.addEventListener('click', () => clearInterval(shakeInterval));
    if (notePopup) notePopup.addEventListener('click', (e) => { if (e.target === notePopup) clearInterval(shakeInterval); });
    setTimeout(() => { if (notePopup) notePopup.style.display = 'none'; clearInterval(shakeInterval); }, 50000);
  }

}); // end DOMContentLoaded
