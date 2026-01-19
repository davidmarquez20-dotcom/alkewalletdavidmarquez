/**
 * ============================================
 * Scripts Centralizados para Mi Billetera
 * ============================================
 * Archivo principal que contiene toda la lógica
 * de JavaScript para la aplicación
 */

// ============================================
// CONFIGURACIÓN INICIAL Y UTILIDADES
// ============================================

// Datos de usuarios para prueba
const users = {
  admin: {
    password: '12345',
    email: 'admin@alkewallet.com'
  }
};

/**
 * Inicializa el localStorage con datos iniciales
 */
function initializeLocalStorage() {
  if (!localStorage.getItem('userBalance')) {
    localStorage.setItem('userBalance', '1000.00');
  }
  if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify([]));
  }
  if (!localStorage.getItem('contacts')) {
    localStorage.setItem('contacts', JSON.stringify([]));
  }
}

/**
 * Muestra alertas de Bootstrap dinámicamente
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de alerta: success, error, warning, info
 */
function showBootstrapAlert(message, type) {
  let alertContainer = $('#alert-container');
  let alertClass = '';
  let icon = '';

  switch (type) {
    case 'success':
      alertClass = 'alert-success';
      icon = 'fa-check-circle';
      break;
    case 'error':
      alertClass = 'alert-danger';
      icon = 'fa-exclamation-circle';
      break;
    case 'warning':
      alertClass = 'alert-warning';
      icon = 'fa-exclamation-triangle';
      break;
    case 'info':
      alertClass = 'alert-info';
      icon = 'fa-info-circle';
      break;
  }

  let alertHTML = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
      <i class="fas ${icon}"></i> ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;

  alertContainer.html(alertHTML);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    alertContainer.find('.alert').fadeOut(() => {
      alertContainer.empty();
    });
  }, 5000);
}

/**
 * Valida un correo electrónico
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
function isValidEmail(email) {
  let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - True si es válida
 */
function isValidPassword(password) {
  return password && password.length >= 4;
}

/**
 * Formatea un número como dinero
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado
 */
function formatMoney(amount) {
  return '$' + parseFloat(amount).toFixed(2);
}

/**
 * Mascara un CBU para mostrarlo de forma segura
 * @param {string} cbu - CBU a mascara
 * @returns {string} - CBU enmascarado
 */
function maskCBU(cbu) {
  return cbu.substring(0, 4) + ' **** **** **** **** ' + cbu.substring(18);
}

// ============================================
// PÁGINA DE LOGIN
// ============================================

$(document).ready(function() {
  // Verificar si estamos en la página de login
  if ($('#loginForm').length) {
    initializeLocalStorage();
    setupLoginForm();
  }

  // Verificar si estamos en la página de menú
  if ($('#depositBtn').length && $('#sendBtn').length) {
    initializeLocalStorage();
    setupMenuPage();
  }

  // Verificar si estamos en la página de depósito
  if ($('#depositForm').length) {
    setupDepositPage();
  }

  // Verificar si estamos en la página de enviar dinero
  if ($('#addContactForm').length) {
    setupSendMoneyPage();
  }

  // Verificar si estamos en la página de transacciones
  if ($('#filterType').length) {
    setupTransactionsPage();
  }
});

/**
 * Configura la funcionalidad de la página de login
 */
function setupLoginForm() {
  $('#loginForm').submit(function(event) {
    event.preventDefault();

    // Obtener valores usando selectores de jQuery
    let email = $('#email').val().trim();
    let password = $('#password').val().trim();

    // Validar campos
    if (!email || !password) {
      showBootstrapAlert('Por favor completa todos los campos', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showBootstrapAlert('Por favor ingresa un correo electrónico válido', 'error');
      return;
    }

    if (!isValidPassword(password)) {
      showBootstrapAlert('La contraseña debe tener al menos 4 caracteres', 'error');
      return;
    }

    // Verificar credenciales
    if (email === 'admin@alkewallet.com' && password === '12345') {
      // Guardar usuario en sesión
      localStorage.setItem('loggedInUser', 'admin');

      // Mostrar alerta de éxito
      showBootstrapAlert('¡Bienvenido! Redirigiendo...', 'success');

      // Redirigir al menú principal
      setTimeout(() => {
        window.location.href = 'menu.html';
      }, 1000);
    } else {
      showBootstrapAlert('Correo o contraseña inválidos', 'error');
    }
  });
}

// ============================================
// PÁGINA DE MENÚ PRINCIPAL
// ============================================

/**
 * Configura la funcionalidad del menú principal
 */
function setupMenuPage() {
  // Asegurar que el localStorage tenga el saldo inicial
  if (!localStorage.getItem('userBalance')) {
    localStorage.setItem('userBalance', '1000.00');
  }
  
  // Actualizar el display del saldo
  updateBalanceDisplay();

  // Evento del botón de Depositar
  $('#depositBtn').click(function() {
    showRedirectMessage('Depósito');
    setTimeout(() => {
      window.location.href = 'deposit.html';
    }, 1000);
  });

  // Evento del botón de Enviar Dinero
  $('#sendBtn').click(function() {
    showRedirectMessage('Enviar Dinero');
    setTimeout(() => {
      window.location.href = 'sendmoney.html';
    }, 1000);
  });

  // Evento del botón de Últimos Movimientos
  $('#transactionsBtn').click(function() {
    showRedirectMessage('Últimos Movimientos');
    setTimeout(() => {
      window.location.href = 'transactions.html';
    }, 1000);
  });

  // Evento del botón de Cerrar Sesión
  $('#logoutBtn').click(function() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  });

  // Actualizar saldo cuando la ventana obtiene el foco
  $(window).on('focus', function() {
    updateBalanceDisplay();
  });
}

/**
 * Muestra mensaje de redirección
 * @param {string} screenName - Nombre de la pantalla hacia la que se redirige
 */
function showRedirectMessage(screenName) {
  let toastMessage = 'Redirigiendo a ' + screenName + '...';
  $('#toastMessage').text(toastMessage);
  $('#loadingToast').fadeIn();

  setTimeout(() => {
    $('#loadingToast').fadeOut();
  }, 2000);
}

/**
 * Actualiza la visualización del saldo
 */
function updateBalanceDisplay() {
  let balance = parseFloat(localStorage.getItem('userBalance') || '1000.00');
  let formattedBalance = formatMoney(balance);
  
  if ($('#balanceDisplay').length > 0) {
    $('#balanceDisplay').text(formattedBalance);
  }
  
  if ($('#lastUpdate').length > 0) {
    $('#lastUpdate').text(new Date().toLocaleTimeString('es-MX'));
  }
}

// ============================================
// PÁGINA DE DEPÓSITO
// ============================================

/**
 * Configura la funcionalidad de la página de depósito
 */
function setupDepositPage() {
  updateCurrentBalance();

  $('#depositForm').submit(function(event) {
    event.preventDefault();

    // Obtener valores del formulario
    let depositAmount = parseFloat($('#depositAmount').val());
    let depositMethod = $('#depositMethod').val();

    // Validar inputs
    if (!depositAmount || depositAmount <= 0) {
      showBootstrapAlert('Por favor ingresa un monto válido mayor a $0.00', 'error');
      return;
    }

    if (!depositMethod) {
      showBootstrapAlert('Por favor selecciona un método de depósito', 'error');
      return;
    }

    // Procesar depósito
    let currentBalance = parseFloat(localStorage.getItem('userBalance') || 0);
    let newBalance = currentBalance + depositAmount;

    // Actualizar saldo en localStorage
    localStorage.setItem('userBalance', newBalance.toFixed(2));

    // Guardar transacción
    saveTransaction('Depósito', depositAmount, 'entrada', null);

    // Mostrar alerta de éxito
    showBootstrapAlert('¡Depósito de ' + formatMoney(depositAmount) + ' realizado exitosamente!', 'success');

    // Mostrar leyenda de depósito
    $('#depositedAmount').text(formatMoney(depositAmount));
    $('#newBalance').text(formatMoney(newBalance));
    $('#depositLegend').slideDown();

    // Resetear formulario
    $('#depositForm')[0].reset();
    updateCurrentBalance();

    // Redirigir al menú después de 2 segundos
    setTimeout(() => {
      window.location.href = 'menu.html';
    }, 2000);
  });
}

/**
 * Actualiza el saldo actual en la página de depósito
 */
function updateCurrentBalance() {
  let balance = parseFloat(localStorage.getItem('userBalance') || 0);
  $('#currentBalance').text(formatMoney(balance));
}

// ============================================
// PÁGINA DE ENVIAR DINERO
// ============================================

/**
 * Configura la funcionalidad de la página de enviar dinero
 */
function setupSendMoneyPage() {
  let selectedContact = null;

  updateBalance();
  loadContacts();

  // Búsqueda de contactos
  $('#searchContact').on('keyup', function() {
    let searchTerm = $(this).val().toLowerCase();
    filterContacts(searchTerm);
  });

  // Formulario para agregar contacto
  $('#addContactForm').submit(function(event) {
    event.preventDefault();

    let name = $('#contactName').val().trim();
    let alias = $('#contactAlias').val().trim();
    let cbu = $('#contactCBU').val().trim();
    let email = $('#contactEmail').val().trim();

    // Validaciones
    if (!name) {
      showBootstrapAlert('Por favor ingresa el nombre del contacto', 'error');
      return;
    }

    if (!cbu || cbu.length !== 7 || !/^\d+$/.test(cbu)) {
      showBootstrapAlert('El CBU debe ser de 7 dígitos numéricos', 'error');
      return;
    }

    if (email && !isValidEmail(email)) {
      showBootstrapAlert('Por favor ingresa un email válido', 'error');
      return;
    }

    // Guardar contacto
    let contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    let newContact = {
      id: Date.now(),
      name: name,
      alias: alias,
      cbu: cbu,
      email: email
    };

    contacts.push(newContact);
    localStorage.setItem('contacts', JSON.stringify(contacts));

    // Mostrar mensaje de éxito
    showBootstrapAlert('¡Contacto guardado exitosamente!', 'success');

    // Resetear formulario
    this.reset();

    // Recargar contactos
    loadContacts();

    // Cambiar a pestaña de contactos
    $('a[href="#existing-contacts"]').tab('show');
  });

  // Formulario de enviar dinero
  $('#sendMoneyFormSubmit').submit(function(event) {
    event.preventDefault();

    let amount = parseFloat($('#sendAmount').val());
    let currentBalance = parseFloat(localStorage.getItem('userBalance') || 0);

    // Validaciones
    if (!amount || amount <= 0) {
      showBootstrapAlert('Por favor ingresa un monto válido', 'error');
      return;
    }

    if (amount > currentBalance) {
      showBootstrapAlert('Saldo insuficiente para realizar esta transferencia', 'error');
      return;
    }

    if (!selectedContact) {
      showBootstrapAlert('Por favor selecciona un contacto', 'error');
      return;
    }

    // Procesar transferencia
    let newBalance = currentBalance - amount;
    localStorage.setItem('userBalance', newBalance.toFixed(2));

    // Guardar transacción
    saveTransaction('Transferencia Enviada', amount, 'salida', selectedContact.name);

    // Mostrar confirmación
    $('#sentAmount').text(formatMoney(amount));
    $('#sentToName').text(selectedContact.name);
    $('#confirmationMessage').slideDown();

    // Ocultar formulario
    $('#sendMoneyForm').slideUp();

    // Resetear formulario
    this.reset();

    // Redirigir después de 3 segundos
    setTimeout(() => {
      window.location.href = 'menu.html';
    }, 3000);
  });

  // Cancelar envío de dinero
  $('#cancelSendBtn').click(function() {
    $('#sendMoneyForm').slideUp();
    selectedContact = null;
  });

  // Funciones auxiliares
  function loadContacts() {
    let contacts = JSON.parse(localStorage.getItem('contacts') || '[]');

    if (contacts.length === 0) {
      $('#contactsList').empty();
      $('#noContactsMsg').show();
      return;
    }

    $('#noContactsMsg').hide();
    renderContacts(contacts);
  }

  function renderContacts(contacts) {
    let html = '';
    contacts.forEach(contact => {
      let displayName = contact.alias ? contact.alias + ' (' + contact.name + ')' : contact.name;
      html += `
        <div class="card mb-3 contact-card" data-contact-id="${contact.id}">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-md-8">
                <h6 class="mb-1 font-weight-bold">${displayName}</h6>
                <small class="text-muted">CBU: ${maskCBU(contact.cbu)}</small>
              </div>
              <div class="col-md-4 text-right">
                <button class="btn btn-sm btn-primary select-contact-btn" data-contact='${JSON.stringify(contact)}'>
                  <i class="fas fa-arrow-right"></i> Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    $('#contactsList').html(html);

    // Eventos de selección de contacto
    $('.select-contact-btn').click(function(e) {
      e.preventDefault();
      let contact = JSON.parse($(this).attr('data-contact'));
      selectContact(contact);
    });
  }

  function filterContacts(searchTerm) {
    let contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    let filtered = contacts.filter(contact => {
      let displayName = (contact.alias + ' ' + contact.name).toLowerCase();
      return displayName.includes(searchTerm);
    });
    renderContacts(filtered);
  }

  function selectContact(contact) {
    selectedContact = contact;
    $('#selectedContactName').text(contact.alias ? contact.alias + ' (' + contact.name + ')' : contact.name);
    $('#selectedContactCBU').text(maskCBU(contact.cbu));
    $('#sendMoneyForm').slideDown();
    $('html, body').animate({ scrollTop: $('#sendMoneyForm').offset().top }, 500);
  }

  function updateBalance() {
    let balance = parseFloat(localStorage.getItem('userBalance') || 0);
    $('#currentBalance').text(formatMoney(balance));
  }
}

// ============================================
// PÁGINA DE TRANSACCIONES
// ============================================

/**
 * Configura la funcionalidad de la página de transacciones
 */
function setupTransactionsPage() {
  let allTransactions = [];

  loadTransactions();

  // Cambio de filtro
  $('#filterType').change(function() {
    let filterType = $(this).val();
    displayTransactions(filterType);
  });

  // Limpiar filtros
  $('#clearFilterBtn').click(function() {
    $('#filterType').val('').change();
  });

  function loadTransactions() {
    allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    displayTransactions('');
  }

  function displayTransactions(filterType) {
    let filtered = allTransactions;

    if (filterType) {
      filtered = allTransactions.filter(t => t.type === filterType);
    }

    if (filtered.length === 0) {
      $('#transactionsList').empty();
      $('#emptyState').show();
      updateStatistics([]);
      return;
    }

    $('#emptyState').hide();
    renderTransactions(filtered);
    updateStatistics(filtered);
  }

  function renderTransactions(transactions) {
    let html = '';

    transactions.forEach(transaction => {
      let icon, badgeClass, textClass;

      switch (transaction.type) {
        case 'Depósito':
          icon = 'fa-plus-circle';
          badgeClass = 'badge-success';
          textClass = 'text-success';
          break;
        case 'Transferencia Enviada':
          icon = 'fa-arrow-right';
          badgeClass = 'badge-warning';
          textClass = 'text-warning';
          break;
        case 'Transferencia Recibida':
          icon = 'fa-arrow-left';
          badgeClass = 'badge-info';
          textClass = 'text-info';
          break;
        default:
          icon = 'fa-exchange-alt';
          badgeClass = 'badge-secondary';
          textClass = 'text-secondary';
      }

      let amountSign = transaction.direction === 'entrada' ? '+' : '-';
      let amountClass = transaction.direction === 'entrada' ? 'text-success' : 'text-danger';

      let recipientInfo = transaction.recipient ? 
        `<br><small class="text-muted">Destinatario: ${transaction.recipient}</small>` : '';

      html += `
        <div class="card mb-3 transaction-card">
          <div class="card-body p-3">
            <div class="row align-items-center">
              <div class="col-auto">
                <div class="transaction-icon ${textClass}">
                  <i class="fas ${icon} fa-2x"></i>
                </div>
              </div>
              <div class="col-md-6">
                <h6 class="mb-1 font-weight-bold">
                  <span class="badge ${badgeClass}">${transaction.type}</span>
                </h6>
                <small class="text-muted">
                  <i class="fas fa-calendar-alt"></i> ${transaction.date}
                </small>
                ${recipientInfo}
              </div>
              <div class="col-md-3 text-right">
                <h5 class="${amountClass} font-weight-bold">
                  ${amountSign}${formatMoney(transaction.amount)}
                </h5>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    $('#transactionsList').html(html);
  }

  function updateStatistics(transactions) {
    let incoming = 0;
    let outgoing = 0;

    transactions.forEach(transaction => {
      if (transaction.direction === 'entrada') {
        incoming += transaction.amount;
      } else {
        outgoing += transaction.amount;
      }
    });

    $('#incomingTotal').text(formatMoney(incoming));
    $('#outgoingTotal').text(formatMoney(outgoing));
    $('#totalTransactions').text(transactions.length);
  }
}

// ============================================
// FUNCIÓN GLOBAL PARA GUARDAR TRANSACCIONES
// ============================================

/**
 * Guarda una transacción en el localStorage
 * @param {string} type - Tipo de transacción
 * @param {number} amount - Monto
 * @param {string} direction - Dirección: entrada o salida
 * @param {string} recipient - Destinatario (opcional)
 */
function saveTransaction(type, amount, direction, recipient = null) {
  let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  let transaction = {
    type: type,
    amount: amount,
    direction: direction,
    recipient: recipient,
    date: new Date().toLocaleString('es-MX'),
    timestamp: Date.now()
  };
  transactions.unshift(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ============================================
// FUNCIONES PARA PÁGINA DE SETUP
// ============================================

/**
 * Mostrar datos actuales en localStorage
 */
function displayCurrentData() {
  let data = {
    userBalance: localStorage.getItem('userBalance'),
    contacts: JSON.parse(localStorage.getItem('contacts') || '[]'),
    transactions: JSON.parse(localStorage.getItem('transactions') || '[]')
  };
  document.getElementById('dataDisplay').innerHTML = JSON.stringify(data, null, 2);
}

/**
 * Cargar saldo de prueba
 */
function loadSampleBalance() {
  localStorage.setItem('userBalance', '5000.00');
  alert('Saldo cargado: $5,000.00');
  displayCurrentData();
}

/**
 * Cargar contactos de ejemplo
 */
function loadSampleContacts() {
  let contacts = [
    {
      id: 1,
      name: 'Juan Martínez',
      alias: 'Mi hermano',
      cbu: '0170068',
      email: 'juan.martinez@email.com'
    },
    {
      id: 2,
      name: 'María García',
      alias: 'Mamá',
      cbu: '0170069',
      email: 'maria.garcia@email.com'
    },
    {
      id: 3,
      name: 'Carlos López',
      alias: 'Jefe de trabajo',
      cbu: '0170070',
      email: 'carlos.lopez@email.com'
    },
    {
      id: 4,
      name: 'Ana Rodríguez',
      alias: 'Amiga del gym',
      cbu: '0170071',
      email: 'ana.rodriguez@email.com'
    },
    {
      id: 5,
      name: 'Luis Fernández',
      alias: 'Abogado',
      cbu: '0170072',
      email: 'luis.fernandez@email.com'
    }
  ];

  localStorage.setItem('contacts', JSON.stringify(contacts));
  alert('Se cargaron 5 contactos de ejemplo');
  displayCurrentData();
}

/**
 * Cargar transacciones de ejemplo
 */
function loadSampleTransactions() {
  let transactions = [
    {
      type: 'Depósito',
      amount: 1000,
      direction: 'entrada',
      recipient: null,
      date: '10/01/2026 14:30:00',
      timestamp: Date.now() - 86400000
    },
    {
      type: 'Transferencia Enviada',
      amount: 150.50,
      direction: 'salida',
      recipient: 'Juan Martínez',
      date: '09/01/2026 10:15:00',
      timestamp: Date.now() - 172800000
    },
    {
      type: 'Depósito',
      amount: 500,
      direction: 'entrada',
      recipient: null,
      date: '08/01/2026 16:45:00',
      timestamp: Date.now() - 259200000
    },
    {
      type: 'Transferencia Enviada',
      amount: 250,
      direction: 'salida',
      recipient: 'María García',
      date: '07/01/2026 09:20:00',
      timestamp: Date.now() - 345600000
    },
    {
      type: 'Transferencia Recibida',
      amount: 300,
      direction: 'entrada',
      recipient: 'Carlos López',
      date: '06/01/2026 11:00:00',
      timestamp: Date.now() - 432000000
    },
    {
      type: 'Depósito',
      amount: 750,
      direction: 'entrada',
      recipient: null,
      date: '05/01/2026 13:30:00',
      timestamp: Date.now() - 518400000
    },
    {
      type: 'Transferencia Enviada',
      amount: 100,
      direction: 'salida',
      recipient: 'Ana Rodríguez',
      date: '04/01/2026 15:00:00',
      timestamp: Date.now() - 604800000
    },
    {
      type: 'Depósito',
      amount: 2000,
      direction: 'entrada',
      recipient: null,
      date: '03/01/2026 10:30:00',
      timestamp: Date.now() - 691200000
    },
    {
      type: 'Transferencia Recibida',
      amount: 450,
      direction: 'entrada',
      recipient: 'Luis Fernández',
      date: '02/01/2026 14:15:00',
      timestamp: Date.now() - 777600000
    },
    {
      type: 'Transferencia Enviada',
      amount: 200,
      direction: 'salida',
      recipient: 'Juan Martínez',
      date: '01/01/2026 11:45:00',
      timestamp: Date.now() - 864000000
    }
  ];

  localStorage.setItem('transactions', JSON.stringify(transactions));
  alert('Se cargaron 10 transacciones de ejemplo');
  displayCurrentData();
}

/**
 * Cargar todos los datos de prueba
 */
function loadAllSampleData() {
  loadSampleBalance();
  loadSampleContacts();
  loadSampleTransactions();
  alert('¡Todos los datos han sido cargados exitosamente!');
  displayCurrentData();
}

/**
 * Limpiar todos los datos
 */
function clearAllData() {
  if (confirm('¿Estás seguro de que deseas limpiar todos los datos? Esta acción no se puede deshacer.')) {
    localStorage.removeItem('userBalance');
    localStorage.removeItem('contacts');
    localStorage.removeItem('transactions');
    localStorage.removeItem('loggedInUser');
    alert('Todos los datos han sido limpiados');
    displayCurrentData();
  }
}