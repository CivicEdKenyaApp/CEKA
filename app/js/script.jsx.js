// Additional JavaScript functionality can be added here

// Example: Form validation
document.addEventListener('DOMContentLoaded', function() {
    // Enable Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    
    // File input validation
    const fileInput = document.getElementById('files');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const files = this.files;
            let valid = true;
            
            for (let i = 0; i < files.length; i++) {
                const fileName = files[i].name;
                const extension = fileName.split('.').pop().toLowerCase();
                const allowedExtensions = ['csv', 'json', 'geojson', 'kml', 'topojson', 'wkt', 'png', 'pdf'];
                
                if (!allowedExtensions.includes(extension)) {
                    valid = false;
                    alert(`File ${fileName} has an unsupported format. Please upload only CSV, JSON, GeoJSON, KML, TopoJSON, WKT, PNG, or PDF files.`);
                    break;
                }
            }
            
            if (!valid) {
                this.value = '';
            }
        });
    }
});