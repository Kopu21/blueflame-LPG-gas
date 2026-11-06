/**
 * LPG Gas Agency & Delivery - Dashboard Logic
 * Refill Booking, Interactive Order Tracking, Dynamic Invoices & Profile
 */

// Initial Default State
const defaultState = {
  user: {
    name: "Vikramaditya Sharma",
    phone: "+91 98765-43210",
    consumerId: "LPG-8842-991",
    lpgId: "3700000088429910",
    address: "Flat 402, Royal Palms Heights, Green Park Avenue, New Delhi - 110016",
    distributor: "Bharat BlueFlame LPG Agency (ID: AG-4421)",
    cylinderType: "14.2 kg Domestic Subsidized",
    svNumber: "SV-IND-778291",
    aadhaarLinked: true,
    bankLinked: true,
    subsidyEligible: true,
    lastRefillDate: "14 Oct 2026"
  },
  activeOrder: {
    orderId: "ORD-994821",
    bookingDate: "Today, 08:30 AM",
    cylinderType: "14.2 kg Domestic Standard",
    amount: 853.00,
    subsidyAmount: 240.00,
    netPayable: 613.00,
    status: "out_for_delivery", // 'placed', 'inspected', 'dispatched', 'out_for_delivery', 'delivered'
    statusStep: 4, // 1 to 5
    estimatedDelivery: "Today, within 45 mins (by 11:30 AM)",
    deliverySlot: "Morning (09:00 AM - 12:00 PM)",
    paymentMethod: "UPI / Online Pre-paid (Successful)",
    deliveryPerson: {
      name: "Rameshwar Yadav",
      phone: "+91 98112-94812",
      rating: 4.9,
      vehicle: "BlueFlame Delivery EV (DL-4C-9821)",
      deliveriesCompleted: 1420
    },
    securityOtp: "5824",
    tareWeight: "15.4 kg",
    gasWeight: "14.2 kg",
    grossWeight: "29.6 kg"
  },
  ordersHistory: [
    {
      id: "ORD-994821",
      date: "05 Nov 2026",
      cylinder: "14.2 kg Domestic Standard",
      amount: 853.00,
      subsidy: 240.00,
      status: "Out for Delivery",
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      payment: "Prepaid UPI",
      invoiceNo: "INV-2026-1102"
    },
    {
      id: "ORD-981240",
      date: "14 Oct 2026",
      cylinder: "14.2 kg Domestic Standard",
      amount: 853.00,
      subsidy: 240.00,
      status: "Delivered",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      payment: "Cash on Delivery",
      invoiceNo: "INV-2026-0984"
    },
    {
      id: "ORD-965412",
      date: "18 Sep 2026",
      cylinder: "14.2 kg Domestic Standard",
      amount: 853.00,
      subsidy: 240.00,
      status: "Delivered",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      payment: "Prepaid Card",
      invoiceNo: "INV-2026-0872"
    },
    {
      id: "ORD-941190",
      date: "22 Aug 2026",
      cylinder: "10 kg Composite Smart Cylinder",
      amount: 690.00,
      subsidy: 180.00,
      status: "Delivered",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      payment: "Prepaid UPI",
      invoiceNo: "INV-2026-0745"
    }
  ]
};

// Initialize State from LocalStorage or Default
let dashboardState = JSON.parse(localStorage.getItem('lpg_dashboard_state')) || defaultState;

function saveDashboardState() {
  localStorage.setItem('lpg_dashboard_state', JSON.stringify(dashboardState));
}

// Ensure logged-in mock session
function ensureSession() {
  let authUser = JSON.parse(localStorage.getItem('lpg_auth_user') || 'null');
  if (!authUser) {
    authUser = {
      name: dashboardState.user.name,
      consumerId: dashboardState.user.consumerId,
      phone: dashboardState.user.phone
    };
    localStorage.setItem('lpg_auth_user', JSON.stringify(authUser));
  }
}

// Switch Dashboard Tab (7 Sidebar Sections)
function switchTab(tabId) {
  const tabs = [
    'tab-overview',
    'tab-booking',
    'tab-tracking',
    'tab-history',
    'tab-billing',
    'tab-profile',
    'tab-support'
  ];
  
  tabs.forEach(t => {
    const el = document.getElementById(t);
    const navBtns = document.querySelectorAll(`.nav-${t}`);
    if (el) {
      if (t === tabId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
    navBtns.forEach(btn => {
      if (t === tabId) {
        btn.classList.add('bg-sky-600', 'text-white', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
      } else {
        btn.classList.remove('bg-sky-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
      }
    });
  });

  // Re-render components for tab
  if (tabId === 'tab-tracking') renderTrackingView();
  if (tabId === 'tab-billing' || tabId === 'tab-history') renderBillingTable();
  if (tabId === 'tab-profile') renderProfileView();

  // If mobile sidebar is open, close it
  const sidebar = document.getElementById('dashboard-sidebar');
  if (sidebar && window.innerWidth < 1024) {
    sidebar.classList.add('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleDashboardSidebar() {
  const sidebar = document.getElementById('dashboard-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('hidden');
  }
}

// Cylinder Prices definition
const CYLINDER_PRICING = {
  'Domestic LPG Cylinder – 14.2 KG': { name: 'Domestic LPG Cylinder – 14.2 KG', price: 853.00, subsidy: 240.00, tare: '15.4 kg', gas: '14.2 kg' },
  'Commercial LPG Cylinder – 19 KG': { name: 'Commercial LPG Cylinder – 19 KG', price: 1780.00, subsidy: 0.00, tare: '18.2 kg', gas: '19.0 kg' },
  '14.2kg-standard': { name: 'Domestic LPG Cylinder – 14.2 KG', price: 853.00, subsidy: 240.00, tare: '15.4 kg', gas: '14.2 kg' },
  '19kg-commercial': { name: 'Commercial LPG Cylinder – 19 KG', price: 1780.00, subsidy: 0.00, tare: '18.2 kg', gas: '19.0 kg' }
};

// Update Booking Price Summary dynamically
function updateBookingCalculation() {
  const cylinderSelect = document.getElementById('book-cylinder-type');
  const qtyInput = document.getElementById('book-qty');
  const calcMrp = document.getElementById('calc-mrp');
  const calcSubsidy = document.getElementById('calc-subsidy');
  const calcTotal = document.getElementById('calc-total');

  if (!cylinderSelect) return;
  const cylKey = cylinderSelect.value;
  const qty = parseInt(qtyInput?.value) || 1;

  if (!cylKey) {
    if (calcMrp) calcMrp.innerText = '₹0.00';
    if (calcSubsidy) calcSubsidy.innerText = '- ₹0.00';
    if (calcTotal) calcTotal.innerText = '₹0.00';
    return;
  }

  const cyl = CYLINDER_PRICING[cylKey] || CYLINDER_PRICING['Domestic LPG Cylinder – 14.2 KG'];
  const cylinderPrice = cyl.price * qty;
  const subsidyVal = cyl.subsidy * qty;
  const totalPayable = cylinderPrice - subsidyVal;

  if (calcMrp) calcMrp.innerText = `₹${cylinderPrice.toFixed(2)}`;
  if (calcSubsidy) calcSubsidy.innerText = subsidyVal > 0 ? `- ₹${subsidyVal.toFixed(2)}` : '₹0.00';
  if (calcTotal) calcTotal.innerText = `₹${totalPayable.toFixed(2)}`;

  // Save selected cylinder to form state
  saveBookingFormState();
}

// Save form state to retain selection when moving between fields
function saveBookingFormState() {
  const cylinderSelect = document.getElementById('book-cylinder-type');
  const consumerId = document.getElementById('book-consumer-id');
  const consumerName = document.getElementById('book-consumer-name');
  const qty = document.getElementById('book-qty');
  const address = document.getElementById('book-address');
  const contact = document.getElementById('book-contact');
  const date = document.getElementById('book-date');

  const state = {
    cylinderType: cylinderSelect ? cylinderSelect.value : '',
    consumerId: consumerId ? consumerId.value : '',
    consumerName: consumerName ? consumerName.value : '',
    qty: qty ? qty.value : '1',
    address: address ? address.value : '',
    contact: contact ? contact.value : '',
    date: date ? date.value : ''
  };

  localStorage.setItem('lpg_booking_form_state', JSON.stringify(state));
}

// Restore form state
function restoreBookingFormState() {
  const saved = localStorage.getItem('lpg_booking_form_state');
  if (!saved) return;
  try {
    const state = JSON.parse(saved);
    const cylinderSelect = document.getElementById('book-cylinder-type');
    const consumerId = document.getElementById('book-consumer-id');
    const consumerName = document.getElementById('book-consumer-name');
    const qty = document.getElementById('book-qty');
    const address = document.getElementById('book-address');
    const contact = document.getElementById('book-contact');
    const date = document.getElementById('book-date');

    if (cylinderSelect && state.cylinderType) cylinderSelect.value = state.cylinderType;
    if (consumerId && state.consumerId) consumerId.value = state.consumerId;
    if (consumerName && state.consumerName) consumerName.value = state.consumerName;
    if (qty && state.qty) qty.value = state.qty;
    if (address && state.address) address.value = state.address;
    if (contact && state.contact) contact.value = state.contact;
    if (date && state.date) date.value = state.date;

    updateBookingCalculation();
  } catch (e) {
    console.error('Error restoring booking form state', e);
  }
}

// Handle Refill Booking Submission
function submitRefillBooking(e) {
  if (e) e.preventDefault();
  
  const cylinderSelect = document.getElementById('book-cylinder-type');
  const consumerIdInput = document.getElementById('book-consumer-id');
  const consumerNameInput = document.getElementById('book-consumer-name');
  const qtyInput = document.getElementById('book-qty');
  const addressInput = document.getElementById('book-address');
  const contactInput = document.getElementById('book-contact');
  const dateInput = document.getElementById('book-date');
  const slotSelect = document.getElementById('book-slot') || document.getElementById('book-delivery-slot');
  const paymentMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 
                        document.querySelector('input[name="payment-method"]:checked')?.value || 'UPI';

  // 1. Cylinder Type Validation (Requirement 1: Do not allow submission without selecting a cylinder)
  const cylKey = cylinderSelect ? cylinderSelect.value.trim() : '';
  if (!cylKey) {
    showToast('Please select a Cylinder Type (Domestic 14.2 KG or Commercial 19 KG) to proceed with your booking.', 'error');
    if (cylinderSelect) cylinderSelect.focus();
    return;
  }

  // 2. Consumer ID / Registered Mobile Validation
  const consumerId = consumerIdInput ? consumerIdInput.value.trim() : '';
  if (!consumerId) {
    showToast('Please enter your Consumer ID or Registered Mobile Number.', 'error');
    if (consumerIdInput) consumerIdInput.focus();
    return;
  }

  // 3. Consumer Name Validation
  const consumerName = consumerNameInput ? consumerNameInput.value.trim() : '';
  if (!consumerName) {
    showToast('Please enter the Consumer Name.', 'error');
    if (consumerNameInput) consumerNameInput.focus();
    return;
  }

  // 4. Quantity Validation
  const qty = parseInt(qtyInput ? qtyInput.value : '1') || 1;
  if (qty < 1 || qty > 5) {
    showToast('Please select a valid quantity between 1 and 5 cylinders.', 'error');
    if (qtyInput) qtyInput.focus();
    return;
  }

  // 5. Delivery Address Validation
  const address = addressInput ? addressInput.value.trim() : '';
  if (!address) {
    showToast('Please enter the complete delivery address.', 'error');
    if (addressInput) addressInput.focus();
    return;
  }

  // 6. Contact Number Validation
  const contact = contactInput ? contactInput.value.trim() : '';
  if (!contact) {
    showToast('Please enter your contact phone number.', 'error');
    if (contactInput) contactInput.focus();
    return;
  }

  // 7. Booking Date
  const bookingDate = dateInput && dateInput.value ? dateInput.value : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const deliverySlot = slotSelect ? slotSelect.value : 'Morning Slot (08:00 AM – 12:00 PM)';

  const cyl = CYLINDER_PRICING[cylKey] || CYLINDER_PRICING['Domestic LPG Cylinder – 14.2 KG'];
  const cylinderPrice = cyl.price * qty;
  const subsidyVal = cyl.subsidy * qty;
  const totalAmount = cylinderPrice - subsidyVal;

  const newOrderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const invoiceNum = "INV-2026-" + Math.floor(1000 + Math.random() * 9000);

  // Update active order state
  dashboardState.activeOrder = {
    orderId: newOrderId,
    bookingDate: `${bookingDate} (Just now)`,
    cylinderType: cyl.name,
    quantity: qty,
    consumerName: consumerName,
    consumerId: consumerId,
    address: address,
    contact: contact,
    amount: cylinderPrice,
    subsidyAmount: subsidyVal,
    netPayable: totalAmount,
    status: "placed",
    statusStep: 1,
    estimatedDelivery: `Today, ${deliverySlot}`,
    deliverySlot: deliverySlot,
    paymentMethod: paymentMethod === 'cod' || paymentMethod === 'COD' ? "Cash on Delivery" : "UPI / Online Prepaid",
    deliveryPerson: {
      name: "Rameshwar Yadav",
      phone: "+91 98112-94812",
      rating: 4.9,
      vehicle: "BlueFlame Delivery EV (DL-4C-9821)",
      deliveriesCompleted: 1421
    },
    securityOtp: newOtp,
    tareWeight: cyl.tare,
    gasWeight: cyl.gas,
    grossWeight: (parseFloat(cyl.tare) + parseFloat(cyl.gas)).toFixed(1) + " kg"
  };

  // Add to order history
  dashboardState.ordersHistory.unshift({
    id: newOrderId,
    date: bookingDate,
    cylinder: cyl.name,
    quantity: qty,
    amount: totalAmount,
    subsidy: subsidyVal,
    status: "Order Confirmed",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    payment: paymentMethod === 'cod' || paymentMethod === 'COD' ? "Cash on Delivery" : "UPI Online",
    invoiceNo: invoiceNum
  });

  // Save to database / persistent storage (Requirement 1, item 9)
  saveDashboardState();
  localStorage.setItem('lpg_active_order', JSON.stringify(dashboardState.activeOrder));
  localStorage.setItem('lpg_bookings', JSON.stringify(dashboardState.ordersHistory));

  showToast(`Refill Booked Successfully! Order #${newOrderId}`, 'success');

  // Trigger modal confirmation with complete booking details (Requirement 1, item 8)
  const confirmModal = document.getElementById('booking-success-modal');
  if (confirmModal) {
    const elOrderId = document.getElementById('modal-order-id');
    const elConsumerName = document.getElementById('modal-consumer-name');
    const elConsumerId = document.getElementById('modal-consumer-id');
    const elCylinderType = document.getElementById('modal-cylinder-type');
    const elQty = document.getElementById('modal-qty');
    const elDateSlot = document.getElementById('modal-date-slot');
    const elAddress = document.getElementById('modal-address');
    const elAmount = document.getElementById('modal-amount');
    const elOtp = document.getElementById('modal-otp');

    if (elOrderId) elOrderId.innerText = newOrderId;
    if (elConsumerName) elConsumerName.innerText = consumerName;
    if (elConsumerId) elConsumerId.innerText = consumerId;
    if (elCylinderType) elCylinderType.innerText = cyl.name;
    if (elQty) elQty.innerText = `${qty} Cylinder${qty > 1 ? 's' : ''}`;
    if (elDateSlot) elDateSlot.innerText = `${bookingDate} • ${deliverySlot}`;
    if (elAddress) elAddress.innerText = address;
    if (elAmount) elAmount.innerText = `₹${totalAmount.toFixed(2)}`;
    if (elOtp) elOtp.innerText = newOtp;

    confirmModal.classList.remove('hidden');
    confirmModal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  } else {
    switchTab('tab-tracking');
  }
}

// Advance Order Tracking Simulation (For Interactive Demo)
function advanceTrackingStep() {
  const steps = ['placed', 'inspected', 'dispatched', 'out_for_delivery', 'delivered'];
  let currentStep = dashboardState.activeOrder.statusStep || 1;
  
  if (currentStep < 5) {
    currentStep++;
  } else {
    currentStep = 1;
  }

  dashboardState.activeOrder.statusStep = currentStep;
  dashboardState.activeOrder.status = steps[currentStep - 1];

  // Update in history as well
  if (dashboardState.ordersHistory.length > 0) {
    const statusTitles = ["Order Placed", "Weight Inspected", "Dispatched", "Out for Delivery", "Delivered"];
    dashboardState.ordersHistory[0].status = statusTitles[currentStep - 1];
  }

  saveDashboardState();
  renderTrackingView();
  showToast(`Order status updated: ${steps[currentStep - 1].replace('_', ' ').toUpperCase()}`, 'info');
}

// Render Tracking View Stepper and Details
function renderTrackingView() {
  const order = dashboardState.activeOrder;
  if (!order) return;

  const currentStep = order.statusStep || 1;

  // Update order banner details
  const orderIdEl = document.getElementById('track-order-id');
  if (orderIdEl) orderIdEl.innerText = order.orderId;
  
  const cylinderEl = document.getElementById('track-cylinder-name');
  if (cylinderEl) cylinderEl.innerText = order.cylinderType;

  const etaEl = document.getElementById('track-eta');
  if (etaEl) etaEl.innerText = order.estimatedDelivery;

  const otpEl = document.getElementById('track-otp');
  if (otpEl) otpEl.innerText = order.securityOtp;

  const tareEl = document.getElementById('track-tare');
  if (tareEl) tareEl.innerText = order.tareWeight;

  const netEl = document.getElementById('track-net');
  if (netEl) netEl.innerText = order.gasWeight;

  const grossEl = document.getElementById('track-gross');
  if (grossEl) grossEl.innerText = order.grossWeight;

  // Stepper Elements
  const stepItems = [
    { id: 'step-1', step: 1, title: 'Booking Confirmed', sub: order.bookingDate },
    { id: 'step-2', step: 2, title: 'Safety & Weight Check', sub: 'Gross: ' + order.grossWeight + ' (Digitally Sealed)' },
    { id: 'step-3', step: 3, title: 'Dispatched from Bottling Hub', sub: 'Van assigned to route' },
    { id: 'step-4', step: 4, title: 'Out for Doorstep Delivery', sub: 'Driver within 2 km of your location' },
    { id: 'step-5', step: 5, title: 'Delivered & Connected', sub: 'Digital weight check verified' }
  ];

  stepItems.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    const circle = el.querySelector('.step-circle');
    const badge = el.querySelector('.step-badge');

    if (currentStep > item.step) {
      // Completed
      circle.className = 'step-circle w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-100 dark:ring-emerald-950';
      circle.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i>';
      if (badge) badge.innerText = "Completed";
    } else if (currentStep === item.step) {
      // Current Active
      circle.className = 'step-circle w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-sky-600 text-white shadow-md ring-4 ring-sky-100 dark:ring-sky-950 animate-pulse';
      circle.innerHTML = item.step;
      if (badge) badge.innerText = "In Progress";
    } else {
      // Pending
      circle.className = 'step-circle w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';
      circle.innerHTML = item.step;
      if (badge) badge.innerText = "Upcoming";
    }
  });

  // Driver Card
  const driverNameEl = document.getElementById('track-driver-name');
  if (driverNameEl) driverNameEl.innerText = order.deliveryPerson.name;
  
  const driverVehicleEl = document.getElementById('track-driver-vehicle');
  if (driverVehicleEl) driverVehicleEl.innerText = order.deliveryPerson.vehicle;

  const driverPhoneEl = document.getElementById('track-driver-phone');
  if (driverPhoneEl) {
    driverPhoneEl.href = `tel:${order.deliveryPerson.phone}`;
    driverPhoneEl.innerText = order.deliveryPerson.phone;
  }

  if (window.lucide) lucide.createIcons();
}

// Render Billing Table
function renderBillingTable() {
  const tableBody = document.getElementById('billing-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  dashboardState.ordersHistory.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition';
    tr.innerHTML = `
      <td class="py-4 px-4 font-mono font-medium text-xs text-sky-600 dark:text-sky-400 text-left">
        ${item.id}
      </td>
      <td class="py-4 px-4 text-sm text-slate-600 dark:text-slate-300 text-left">
        ${item.date}
      </td>
      <td class="py-4 px-4 text-sm font-medium text-slate-900 dark:text-white text-left">
        ${item.cylinder}
      </td>
      <td class="py-4 px-4 text-sm text-slate-700 dark:text-slate-200 text-right font-semibold">
        ₹${item.amount.toFixed(2)}
      </td>
      <td class="py-4 px-4 text-sm text-emerald-600 dark:text-emerald-400 text-right font-medium">
        ₹${item.subsidy.toFixed(2)}
      </td>
      <td class="py-4 px-4 text-center">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.badgeClass}">
          ${item.status}
        </span>
      </td>
      <td class="py-4 px-4 text-center">
        <button onclick="openInvoiceModal('${item.id}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 transition border border-sky-200 dark:border-slate-700">
          <i data-lucide="receipt" class="w-3.5 h-3.5"></i>
          <span>View Invoice</span>
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

// Render Profile View
function renderProfileView() {
  const u = dashboardState.user;
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setEl('prof-name', u.name);
  setEl('prof-consumer-id', u.consumerId);
  setEl('prof-lpg-id', u.lpgId);
  setEl('prof-phone', u.phone);
  setEl('prof-address', u.address);
  setEl('prof-distributor', u.distributor);
  setEl('prof-sv-number', u.svNumber);
  setEl('prof-cylinder-pref', u.cylinderType);
  setEl('prof-last-refill', u.lastRefillDate);
}

// Open Printable/Downloadable Tax Invoice Modal
function openInvoiceModal(orderId) {
  const order = dashboardState.ordersHistory.find(o => o.id === orderId) || dashboardState.ordersHistory[0];
  const user = dashboardState.user;

  const modal = document.getElementById('invoice-modal');
  if (!modal) return;

  document.getElementById('inv-no').innerText = order.invoiceNo || 'INV-2026-9901';
  document.getElementById('inv-order-id').innerText = order.id;
  document.getElementById('inv-date').innerText = order.date;
  document.getElementById('inv-customer-name').innerText = user.name;
  document.getElementById('inv-consumer-id').innerText = user.consumerId;
  document.getElementById('inv-lpg-id').innerText = user.lpgId;
  document.getElementById('inv-address').innerText = user.address;
  document.getElementById('inv-cylinder-desc').innerText = order.cylinder;
  document.getElementById('inv-mrp').innerText = `₹${order.amount.toFixed(2)}`;
  document.getElementById('inv-subsidy').innerText = `- ₹${order.subsidy.toFixed(2)}`;
  document.getElementById('inv-net').innerText = `₹${(order.amount - order.subsidy).toFixed(2)}`;
  document.getElementById('inv-payment-mode').innerText = order.payment;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeInvoiceModal() {
  const modal = document.getElementById('invoice-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  ensureSession();
  
  // Set default tab if parameter exists
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab');
  if (requestedTab) {
    switchTab(`tab-${requestedTab}`);
  } else {
    switchTab('tab-overview');
  }

  // Restore saved form state
  restoreBookingFormState();

  // If cylinder parameter is passed in URL (from Home or services), set it
  const cylParam = urlParams.get('cylinder') || localStorage.getItem('lpg_preselected_cylinder');
  const cylSelect = document.getElementById('book-cylinder-type');
  if (cylSelect && cylParam) {
    // Look for matching option
    for (let i = 0; i < cylSelect.options.length; i++) {
      if (cylSelect.options[i].value === cylParam || cylParam.includes(cylSelect.options[i].value) || cylSelect.options[i].value.includes(cylParam)) {
        cylSelect.selectedIndex = i;
        break;
      }
    }
  }

  const cidParam = urlParams.get('consumerId') || localStorage.getItem('lpg_preselected_consumer_id');
  const cidInput = document.getElementById('book-consumer-id');
  if (cidInput && cidParam) {
    cidInput.value = cidParam;
  }

  // Set today's date if empty
  const dateInput = document.getElementById('book-date');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Bind change and input listeners to retain form state
  const formFields = ['book-cylinder-type', 'book-consumer-id', 'book-consumer-name', 'book-qty', 'book-address', 'book-contact', 'book-date'];
  formFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        saveBookingFormState();
        updateBookingCalculation();
      });
      el.addEventListener('input', saveBookingFormState);
    }
  });

  updateBookingCalculation();
});
