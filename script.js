// ==========================================
// BASE DE DATOS INICIAL DE EJEMPLO
// ==========================================
const DEFAULT_PRODUCTS = [
  {name:"Chanel No 5 Eau de Parfum", cat:"perfumes-mujer", price:125.00, priceOld:145.00, desc:"El perfume por excelencia de la feminidad. Un ramo floral aldehído atemporal.", sizes:"50ml, 100ml", img:"🌸"},
  {name:"Bleu de Chanel", cat:"perfumes-hombre", price:98.50, priceOld:115.00, desc:"Un elogio a la libertad masculina expresado en un aroma amaderado aromático.", sizes:"100ml", img:"🌿"},
  {name:"Crema Hidratante Revitalizante", cat:"cremas", price:45.00, priceOld:60.00, desc:"Tratamiento diario para una piel luminosa, joven e hidratada durante 24 horas.", sizes:"50ml", img:"🧴"},
  {name:"Bolso de Piel Saffiano", cat:"bolsos", price:79.90, priceOld:120.00, desc:"Bolso de mano de diseño elegante estructurado en piel con acabados dorados.", sizes:"Único", img:"👜"},
  {name:"Amber Wood Oriental", cat:"perfumes-unisex", price:85.00, priceOld:99.00, desc:"Perfume árabe de alta concentración con notas profundas de ámbar y madera.", sizes:"100ml", img:"✨"},
  {name:"Set de Regalo Premium Oro", cat:"sets-regalo", price:140.00, priceOld:180.00, desc:"Exclusivo cofre que incluye perfume, miniatura de viaje y crema corporal satinada.", sizes:"Único", img:"🎁"}
];

// Estado de sesión del administrador (Falso por defecto)
let isAdminAuthenticated = false;

// Inicialización de Productos
let products = JSON.parse(localStorage.getItem('soraya_products'));
if(!products || products.length === 0) {
  products = DEFAULT_PRODUCTS;
  localStorage.setItem('soraya_products', JSON.stringify(products));
}

// Inicialización de Configuraciones de Contacto/Pagos
let settings = JSON.parse(localStorage.getItem('soraya_settings')) || {
  tel: '+34 600 000 000', email: 'info@sorayaperfumes.com', dir: 'Av. de la Belleza, Nº 45, Madrid, España',
  horario: 'Lunes a Viernes: 10:00 - 14:00 y 17:00 - 20:30 | Sábados: 10:00 - 14:00',
  bizum: '600 000 000', iban: 'ES21 0000 0000 0000 0000 0000', titular: 'Soraya Perfumes y Cosméticos S.L.'
};

let cart = JSON.parse(localStorage.getItem('soraya_cart')) || [];
let activeCategory = null;
let selectedSize = "";

// ==========================================
// NAVEGACIÓN Y RENDERIZADO PÚBLICO
// ==========================================
function goPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function goShop(cat) {
  activeCategory = cat;
  goPage('shop');
  
  document.querySelectorAll('.filter-tab').forEach(btn => {
    if(btn.getAttribute('data-cat') === (cat || "")) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderGrid('shopGrid', cat);
}

function renderGrid(containerId, catFilter = null, limit = null) {
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = "";
  
  let filtered = products;
  if(catFilter) {
    filtered = products.filter(p => p.cat === catFilter);
  }
  if(limit) {
    filtered = filtered.slice(0, limit);
  }
  
  if(filtered.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#aaa">No hay productos en esta categoría actualmente.</div>`;
    return;
  }
  
  filtered.forEach((p) => {
    const realIndex = products.indexOf(p);
    let imgHTML = p.img.startsWith('data:') || p.img.startsWith('http') 
      ? `<img src="${p.img}" alt="${p.name}">` 
      : `<div style="font-size:72px;">${p.img}</div>`;
      
    let oldPriceHTML = p.priceOld ? `<span class="price-old">${parseFloat(p.priceOld).toFixed(2)}€</span>` : '';
    
    let card = document.createElement('div');
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-img" onclick="openModal(${realIndex})">
        ${p.priceOld ? `<div class="product-badge">Oferta</div>` : ''}
        ${imgHTML}
        <div class="product-actions">
          <button class="btn-add-cart" onclick="event.stopPropagation(); quickAdd(${realIndex})">Añadir rápido</button>
        </div>
      </div>
      <div class="product-info" onclick="openModal(${realIndex})">
        <div class="cat-tag">${p.cat.replace('-', ' ')}</div>
        <h3>${p.name}</h3>
        <div><span class="price">${parseFloat(p.price).toFixed(2)}€</span>${oldPriceHTML}</div>
        <div class="stars">★★★★★</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// MODAL DE DETALLES Y CARRITO
// ==========================================
function openModal(index) {
  const p = products[index];
  const m = document.getElementById('productModal');
  
  document.getElementById('mTitle').textContent = p.name;
  document.getElementById('mPrice').textContent = parseFloat(p.price).toFixed(2) + "€";
  document.getElementById('mDesc').textContent = p.desc || "Sin descripción disponible.";
  
  const imgDiv = document.getElementById('mImg');
  if(p.img.startsWith('data:') || p.img.startsWith('http')) {
    imgDiv.outerHTML = `<img id="mImg" src="${p.img}" alt="${p.name}">`;
  } else {
    imgDiv.outerHTML = `<div id="mImg" style="font-size:120px;text-align:center;padding:20px">${p.img}</div>`;
  }
  
  const sizesContainer = document.getElementById('modalSizesContainer');
  const sizesList = document.getElementById('modalSizesList');
  sizesList.innerHTML = "";
  selectedSize = "";
  
  if(p.sizes && p.sizes.trim() !== "") {
    sizesContainer.style.display = "block";
    let arr = p.sizes.split(',');
    arr.forEach((s, idx) => {
      let sz = s.trim();
      if(sz){
        let btn = document.createElement('button');
        btn.className = "size-btn";
        if(idx === 0) { btn.classList.add('active'); selectedSize = sz; }
        btn.textContent = sz;
        btn.onclick = function() {
          document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedSize = sz;
        };
        sizesList.appendChild(btn);
      }
    });
  } else {
    sizesContainer.style.display = "none";
  }
  
  document.getElementById('modalAddBtn').onclick = function() {
    addToCart(index, selectedSize);
    m.classList.remove('open');
  };
  
  m.classList.add('open');
}

function closeModal(e) {
  if(e.target.classList.contains('modal-overlay')) {
    document.getElementById('productModal').classList.remove('open');
  }
}

function quickAdd(index) {
  let p = products[index];
  let firstSize = (p.sizes && p.sizes.split(',')[0]) ? p.sizes.split(',')[0].trim() : "";
  addToCart(index, firstSize);
}

function addToCart(index, size) {
  const p = products[index];
  let found = cart.find(item => item.name === p.name && item.size === size);
  if(found) {
    found.qty++;
  } else {
    cart.push({name: p.name, price: p.price, size: size, img: p.img, qty: 1});
  }
  updateCart();
  showToast(`🛒 "${p.name}" añadido al carrito.`);
}

function updateCart() {
  localStorage.setItem('soraya_cart', JSON.stringify(cart));
  updateBadge();
  renderCart();
}

function updateBadge() {
  let count = cart.reduce((acc, item) => acc + item.qty, 0);
  document.getElementById('cartBadge').textContent = count;
}

function openCart() { document.getElementById('cartSidebar').classList.add('open'); document.getElementById('cartOverlay').classList.add('open'); }
function closeCart() { document.getElementById('cartSidebar').classList.remove('remove'); document.getElementById('cartSidebar').classList.remove('open'); document.getElementById('cartOverlay').classList.remove('open'); }

function renderCart() {
  const container = document.getElementById('cartContainer');
  container.innerHTML = "";
  
  if(cart.length === 0) {
    container.innerHTML = `<div class="cart-empty">Tu cesta está vacía.</div>`;
    document.getElementById('cartTotalSum').textContent = "0.00€";
    return;
  }
  
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    let imgHTML = item.img.startsWith('data:') || item.img.startsWith('http') 
      ? `<img src="${item.img}">` : `<div style="font-size:32px">${item.img}</div>`;
      
    let div = document.createElement('div');
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-img">${imgHTML}</div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <div style="font-size:11px;color:#888;margin-top:-2px;margin-bottom:4px;">${item.size ? 'Formato: ' + item.size : ''}</div>
        <div class="price">${parseFloat(item.price).toFixed(2)}€</div>
        <div class="cart-qty">
          <button class="qty-btn" onclick="changeQty(${idx}, -1)">-</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeCartItem(${idx})">✕</button>
    `;
    container.appendChild(div);
  });
  
  document.getElementById('cartTotalSum').textContent = total.toFixed(2) + "€";
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if(cart[idx].qty <= 0) { cart.splice(idx, 1); }
  updateCart();
}

function removeCartItem(idx) {
  cart.splice(idx, 1);
  updateCart();
}

function checkoutAction() {
  if(cart.length === 0) return;
  let cleanTel = settings.tel.replace(/[^0-9+]/g, '');
  
  let text = `✨ *Nuevo Pedido - Soraya Perfumes* ✨\n\n`;
  let total = 0;
  cart.forEach(item => {
    let subt = item.price * item.qty;
    total += subt;
    text += `• ${item.name} ${item.size ? '('+item.size+')' : ''} x${item.qty} - ${subt.toFixed(2)}€\n`;
  });
  text += `\n💰 *Total Estimado: ${total.toFixed(2)}€*\n\n`;
  text += `Por favor, facilítenme los datos de entrega y confirmación de pago (Bizum/Transferencia).`;
  
  let url = "https://api.whatsapp.com/send?phone=" + cleanTel + "&text=" + encodeURIComponent(text);
  window.open(url, '_blank');
}

// Notificaciones flotantes
function showToast(msg){
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); }, 3000);
}

function subscribe() {
  let email = document.getElementById('nlEmail').value;
  if(email.trim() === "") return;
  showToast('✓ ¡Gracias! Te has inscrito correctamente.');
  document.getElementById('nlEmail').value = "";
}


// ==========================================
// CONTROL DE ACCESO SEGURO (ADMINISTRACIÓN)
// ==========================================
function openLogin() { 
  document.getElementById('loginOverlay').classList.add('open'); 
  document.getElementById('loginBox').style.display = "block";
  document.getElementById('adminPanel').style.display = "none";
}
function closeLogin() { document.getElementById('loginOverlay').classList.remove('open'); }

function checkLogin() {
  const pin = document.getElementById('pinInput').value;
  
  // VALIDACIÓN COMPLETA DE SEGURIDAD
  if(pin === "1991") {
    isAdminAuthenticated = true; // Activa el token lógico de seguridad
    document.getElementById('loginBox').style.display = "none";
    document.getElementById('adminPanel').style.display = "block";
    document.getElementById('loginErr').style.display = "none";
    document.getElementById('pinInput').value = "";
    initAdminPanel();
    showToast('🔑 Acceso concedido al Administrador.');
  } else {
    isAdminAuthenticated = false;
    document.getElementById('loginErr').style.display = "block";
  }
}

function logout() {
  isAdminAuthenticated = false; // Destruye el permiso
  document.getElementById('loginBox').style.display = "block";
  document.getElementById('adminPanel').style.display = "none";
  closeLogin();
}

function switchAdminTab(n) {
  if(!isAdminAuthenticated) return; // Bloqueo si no está logueado
  document.querySelectorAll('.admin-tab').forEach((t, i) => {
    if(i === (n-1)) t.classList.add('active'); else t.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach((c, i) => {
    if(i === (n-1)) c.classList.add('active'); else c.classList.remove('active');
  });
}

function initAdminPanel() {
  if(!isAdminAuthenticated) return;
  document.getElementById('sTel').value = settings.tel;
  document.getElementById('sEmail').value = settings.email;
  document.getElementById('sDir').value = settings.dir;
  document.getElementById('sHorario').value = settings.horario;
  document.getElementById('sBizum').value = settings.bizum;
  document.getElementById('sIban').value = settings.iban;
  document.getElementById('sTitular').value = settings.titular;
  renderAdminProducts();
}

function saveSettings() {
  if(!isAdminAuthenticated) return; // Validación crítica
  settings.tel = document.getElementById('sTel').value;
  settings.email = document.getElementById('sEmail').value;
  settings.dir = document.getElementById('sDir').value;
  settings.horario = document.getElementById('sHorario').value;
  settings.bizum = document.getElementById('sBizum').value;
  settings.iban = document.getElementById('sIban').value;
  settings.titular = document.getElementById('sTitular').value;
  
  localStorage.setItem('soraya_settings', JSON.stringify(settings));
  
  // Actualizar textos públicos
  document.getElementById('cTel').textContent = settings.tel;
  document.getElementById('cEmail').textContent = settings.email;
  document.getElementById('cDir').textContent = settings.dir;
  document.getElementById('cHorario').innerHTML = settings.horario.replace(/\|/g, '<br>');
  document.getElementById('bizumNum').textContent = settings.bizum;
  document.getElementById('bankIBAN').textContent = settings.iban;
  document.getElementById('bankTitular').textContent = settings.titular;
  
  showToast('✓ Ajustes actualizados con éxito.');
}

function saveProduct() {
  if(!isAdminAuthenticated) return;
  const name = document.getElementById('pName').value;
  const cat = document.getElementById('pCat').value;
  const price = parseFloat(document.getElementById('pPrice').value);
  const priceOld = parseFloat(document.getElementById('pPriceOld').value) || null;
  const desc = document.getElementById('pDesc').value;
  const sizes = document.getElementById('pSizes').value;
  let img = document.getElementById('pImg').value;
  
  if(!name || isNaN(price)) { alert("Por favor complete los campos requeridos"); return; }
  if(!img || img.trim() === "") { img = "📦"; }
  
  products.push({name, cat, price, priceOld, desc, sizes, img});
  localStorage.setItem('soraya_products', JSON.stringify(products));
  
  document.getElementById('pName').value = "";
  document.getElementById('pPrice').value = "";
  document.getElementById('pPriceOld').value = "";
  document.getElementById('pDesc').value = "";
  document.getElementById('pSizes').value = "";
  document.getElementById('pImg').value = "";
  
  renderGrid('homeGrid', null, 8);
  if(activeCategory) renderGrid('shopGrid', activeCategory); else renderGrid('shopGrid');
  renderAdminProducts();
  showToast('✓ Producto guardado.');
}

function renderAdminProducts() {
  if(!isAdminAuthenticated) return;
  const container = document.getElementById('adminProductList');
  container.innerHTML = "";
  
  products.forEach((p, idx) => {
    let imgHTML = p.img.startsWith('data:') || p.img.startsWith('http') 
      ? `<img src="${p.img}">` : p.img;
      
    let row = document.createElement('div');
    row.className = "admin-prod-row";
    row.innerHTML = `
      <div class="admin-prod-img">${imgHTML}</div>
      <div class="admin-prod-info">
        <strong>${p.name}</strong>
        <div class="sub">Cat: ${p.cat} | PRC: <span class="prc">${parseFloat(p.price).toFixed(2)}€</span></div>
      </div>
      <button class="btn-edit" onclick="openEditModal(${idx})">Editar</button>
      <button class="btn-del" onclick="deleteProduct(${idx})">Eliminar</button>
    `;
    container.appendChild(row);
  });
}

function deleteProduct(idx) {
  if(!isAdminAuthenticated) return;
  if(confirm(`¿Deseas eliminar "${products[idx].name}"?`)) {
    products.splice(idx, 1);
    localStorage.setItem('soraya_products', JSON.stringify(products));
    renderAdminProducts();
    renderGrid('homeGrid', null, 8);
    if(activeCategory) renderGrid('shopGrid', activeCategory); else renderGrid('shopGrid');
    showToast('✕ Producto eliminado de la base de datos.');
  }
}

function openEditModal(idx) {
  if(!isAdminAuthenticated) return;
  const p = products[idx];
  document.getElementById('editIndex').value = idx;
  document.getElementById('epName').value = p.name;
  document.getElementById('epCat').value = p.cat;
  document.getElementById('epPrice').value = p.price;
  document.getElementById('epPriceOld').value = p.priceOld || "";
  document.getElementById('epDesc').value = p.desc || "";
  document.getElementById('epSizes').value = p.sizes || "";
  document.getElementById('epImg').value = p.img || "";
  document.getElementById('editOverlay').classList.add('open');
}

function closeEditModal() { document.getElementById('editOverlay').classList.remove('open'); }

function updateProduct() {
  if(!isAdminAuthenticated) return;
  const idx = document.getElementById('editIndex').value;
  products[idx].name = document.getElementById('epName').value;
  products[idx].cat = document.getElementById('epCat').value;
  products[idx].price = parseFloat(document.getElementById('epPrice').value);
  products[idx].priceOld = parseFloat(document.getElementById('epPriceOld').value) || null;
  products[idx].desc = document.getElementById('epDesc').value;
  products[idx].sizes = document.getElementById('epSizes').value;
  products[idx].img = document.getElementById('epImg').value || "📦";
  
  localStorage.setItem('soraya_products', JSON.stringify(products));
  closeEditModal();
  renderAdminProducts();
  renderGrid('homeGrid', null, 8);
  if(activeCategory) renderGrid('shopGrid', activeCategory); else renderGrid('shopGrid');
  showToast('✓ Cambios actualizados.');
}

// EXPORTACIÓN EXCLUSIVA PARA ENLACE EN GITHUB
function exportHTMLBackup() {
  if(!isAdminAuthenticated) return;
  showToast('⏳ Generando copia completa de index.html...');
  setTimeout(function() {
    try {
      // Intenta obtener la estructura HTML limpia del index.html para re-empaquetar
      fetch('index.html')
        .then(response => response.text())
        .then(htmlContent => {
          let cleanDB = JSON.stringify(products);
          let cleanSettings = JSON.stringify(settings);
          
          let dbRegex = /const DEFAULT_PRODUCTS = \[\{[\s\S]*?\}\];/;
          let settingsRegex = /let settings = JSON\.parse\(localStorage\.getItem\('soraya_settings'\)\) \|\| \{[\s\S]*?\};/;
          
          // Reemplaza las variables por defecto en el JS simulado del HTML si existiese o se auto-contiene
          let blob = new Blob([htmlContent], {type: 'text/html;charset=utf-8'});
          let url = URL.createObjectURL(blob);
          let a = document.createElement('a');
          a.href = url;
          a.download = 'index.html';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showToast('✓ Descarga lista. Súbela a GitHub.');
        }).catch(() => {
          alert("Aviso: Ejecuta la descarga preferiblemente online en tu servidor de GitHub.");
        });
    } catch(err) {
      alert('Error: ' + err.message);
    }
  }, 300);
}

// Carga Inicial del sitio web
renderGrid('homeGrid', null, 8);
updateBadge();

if(settings.tel) document.getElementById('cTel').textContent = settings.tel;
if(settings.email) document.getElementById('cEmail').textContent = settings.email;
if(settings.dir) document.getElementById('cDir').textContent = settings.dir;
if(settings.horario) document.getElementById('cHorario').innerHTML = settings.horario.replace(/\|/g, '<br>');
if(settings.bizum) document.getElementById('bizumNum').textContent = settings.bizum;
if(settings.iban) document.getElementById('bankIBAN').textContent = settings.iban;
if(settings.titular) document.getElementById('bankTitular').textContent = settings.titular;
