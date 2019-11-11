document.addEventListener("DOMContentLoaded", function() {
    $('#fileInput').on('change', function(e) {
        var fileName = '';
        if(this.files && this.files.length > 1)
            fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
        else
            fileName = e.target.value.split('\\').pop()
        
        if(fileName)
            $('#fileText').html(fileName);
        else
            $('#fileLabel').html(labelVal);
    });
});