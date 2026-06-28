// ===== Generador QR para URLs =====
// Usa la librería QRCode.js desde CDN

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        urlInput: document.getElementById('qr-url'),
        sizeInput: document.getElementById('qr-size'),
        colorInput: document.getElementById('qr-color'),
        bgInput: document.getElementById('qr-bg'),
        levelInput: document.getElementById('qr-level'),
        generateBtn: document.getElementById('btn-generate'),
        qrContainer: document.getElementById('qr-container'),
        qrOutput: document.getElementById('qr-output'),
        previewCard: document.querySelector('.preview-card')
    };

    let currentQR = null;

    // Actualizar valor de color mostrado
    elements.colorInput.addEventListener('input', (e) => {
        e.target.nextElementSibling.textContent = e.target.value;
    });
    elements.bgInput.addEventListener('input', (e) => {
        e.target.nextElementSibling.textContent = e.target.value;
    });

    // Generar y descargar QR automáticamente
    elements.generateBtn.addEventListener('click', generateAndDownloadQR);

    // También al presionar Enter en el input de URL
    elements.urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            generateAndDownloadQR();
        }
    });

    function generateAndDownloadQR() {
        const url = elements.urlInput.value.trim();
        
        if (!url) {
            showToast('⚠️ Ingresa una URL válida', 'warning');
            elements.urlInput.focus();
            return;
        }

        // Validar que parezca una URL
        let finalUrl = url;
        if (!url.match(/^https?:\/\//i) && !url.match(/^mailto:/i) && !url.match(/^tel:/i)) {
            finalUrl = 'https://' + url;
        }

        const size = parseInt(elements.sizeInput.value) || 512;
        const color = elements.colorInput.value;
        const bgColor = elements.bgInput.value;
        const level = elements.levelInput.value;

        // Limpiar QR anterior
        elements.qrOutput.innerHTML = '';

        // Crear nuevo QR
        try {
            currentQR = new QRCode(elements.qrOutput, {
                text: finalUrl,
                width: size,
                height: size,
                colorDark: color,
                colorLight: bgColor,
                correctLevel: parseInt(level)
            });

            // Mostrar resultado en la vista previa
            elements.qrContainer.style.display = 'none';
            elements.qrOutput.style.display = 'block';
            elements.qrOutput.classList.add('show');
            elements.previewCard.classList.add('has-qr');

            // Descargar automáticamente después de un breve delay
            setTimeout(() => {
                downloadQR(finalUrl);
            }, 400);

            showToast('✅ QR generado y descargado', 'success');
        } catch (error) {
            console.error('Error al generar QR:', error);
            showToast('❌ Error al generar el QR', 'error');
        }
    }

    function downloadQR(urlText) {
        // Obtener la imagen del QR
        const img = elements.qrOutput.querySelector('img');
        const canvas = elements.qrOutput.querySelector('canvas');

        let dataURL;
        
        if (img && img.src) {
            dataURL = img.src;
        } else if (canvas) {
            dataURL = canvas.toDataURL('image/png');
        } else {
            showToast('❌ No se pudo descargar la imagen', 'error');
            return;
        }

        // Crear nombre de archivo a partir de la URL
        let filename = 'qr-code';
        try {
            const urlObj = new URL(urlText);
            filename = urlObj.hostname.replace(/^www\./, '').split('.')[0] || 'qr-code';
        } catch (e) {
            filename = urlText.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30) || 'qr-code';
        }
        filename += '.png';

        // Crear enlace de descarga y ejecutar
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Sistema de notificaciones toast
    function showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        if (type === 'warning') {
            toast.style.background = '#f59e0b';
            toast.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.3)';
        } else if (type === 'error') {
            toast.style.background = '#ef4444';
            toast.style.boxShadow = '0 10px 30px rgba(239, 68, 68, 0.3)';
        }

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
