
(function(){
	$('.start-upload-steps').on('click',function(){
		if($('#agreed').is(':checked')){
			$('.submission-instructions').next('.upload-steps').show();
			$('.submission-instructions').remove();
		}
		else{
			$("<span class='not-agreed'>** You must agree with the terms and conditions to proceed</span>").insertAfter('#agree-label');
		}
	});


	$('.data-status input').on('click',function(){
		let $this = $(this);
		if($.trim($this.data('val')) == "yes"){
			$this.closest('.data-status').find('.sub-fields-container').html("<input type='text' name='reference' class='conditional-fields sub-fields' placeholder='Reference' required><input type='text' name='doi' class='conditional-fields sub-fields' placeholder='DOI' required>");
		}
		if($.trim($this.data('val')) == "no"){
			$this.closest('.data-status').find('.sub-fields-container').empty();
		}
	});


	$('.embargo-status input').on('click',function(){
		let $this = $(this);
		if($.trim($this.data('val')) == "yes"){
			$this.closest('.embargo-status').find('.sub-fields-container').html("<input id='date-picker' type='text' name='date' class='conditional-fields sub-fields' placeholder='mm-dd-yy' required style='cursor:pointer;'><i class='fa fa-calendar' aria-hidden='true' style='margin-left: -40px; z-index:-1;'></i>");
			$( "#date-picker" ).datepicker({ 
			    changeYear: true,
			    changeMonth: true, 
			    dateFormat: 'mm-dd-yy',
			    minDate: 'today',
				maxDate: "+1y"
			});
		}
		if($.trim($this.data('val')) == "no"){
			$this.closest('.embargo-status').find('.sub-fields-container').empty();
		}
	});


	$('.go-next').on('click',function(){
		let goNext = true;
		let $this = $(this);
		$('#upload-form input[required]').each(function(){
			if($(this).val() == ""){
				goNext = false;
			}
		});
		$('#upload-form select[required]').each(function(){
			if($(this).val() == ""){
				goNext = false;
			}
		});
		if(goNext){
			$this.hide().siblings().show();
			$('.basic-information').addClass('hidden');
			$('.upload-files').removeClass('hidden');
			$('.steps .selected').removeClass('selected').siblings().addClass('selected');	
		}
		else{
			$('#submit-form').trigger('click');
		}
	});


	$('.go-back').on('click',function(){
		let $this = $(this);
		$this.prev().show().siblings().hide();
		$('.upload-files').addClass('hidden');
		$('.basic-information').removeClass('hidden');
		$('.steps .selected').removeClass('selected').siblings().addClass('selected');
	});


	$('.trigger-input').on('click',function(){
		$(this).next('input[type=file]').trigger('click');
	});


	$('.metadata-input').on('change',function(){
		let $this = $(this);
		let fileName = $this[0].files[0].name;
		console.log(fileName);
		let givenFormat = checkFileType(fileName);
		if (givenFormat != '.csv'){
			alert('The file you are trying to upload is in ' + givenFormat + '. Metadata file must be in .csv Format');
			$this.val('');
		}
	});


	$('.rawdata-input').on('change',function(){
		let $this = $(this);
		let fileName = $this[0].files[0].name;
		let givenFormat = checkFileType(fileName);
		if ( givenFormat != '.zip'){
			alert('The file you are trying to upload is in ' + givenFormat + '. Rawdata file must be in .zip Format');
			$this.val('');
		}
	});

	
	function checkFileType(file){
		return file.substr(file.length - 4);
	}
})();