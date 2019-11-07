document.addEventListener("DOMContentLoaded", function() {
    constants.fileInput.addEventListener('change', function(e) {
        var fileName = '';
        if(this.files && this.files.length > 1)
            fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
        else
            fileName = e.target.value.split('\\').pop()
        
        if(fileName)
            constants.fileText.innerHTML = fileName;
        else
            constants.fileLabel.innerHTML = labelVal;
    });
});

    /*
    var inputs = document.querySelectorAll('.uploadInputFile');
    Array.prototype.forEach.call(inputs, function(input) {
        var label = input.nextElementSibling,
        labelVal = label.innerHTML;
        console.log("STARTED")
        input.addEventListener('change', function(e) {
            var fileName = '';
            if(this.files && this.files.length > 1)
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            else
                fileName = e.target.value.split('\\').pop()
            
            if(fileName)
                label.querySelector('.uploadFileText').innerHTML = fileName;
            else
                label.innerHTML = labelVal;
        });

        input.addEventListener('focus', function() {input.classList.add('has-focus');});
        input.addEventListener('blur', function() {input.classList.remove('has-focus');});
    });
    */