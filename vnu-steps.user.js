// ==UserScript==
// @name       VNU Steps script
// @namespace  http://nationalvacature.nl/
// @version    0.1
// @description Autofill VNU multistep forms
// @match      */werkgever/vacature-plaatsen/*
// @match      */werkgever/producten-afrekenen/*
// @copyright  2013+, Tararasik
// ==/UserScript==

$(function() {
    var $style = $('<style>' +
        '#vnu-step-navigation {' +
	        'position: fixed; top: 0; background-color: #ccc; color: #000; z-index: 100; width: 500px;}' +
        '#vnu-step-navigation li {' +
                   'float: left; margin-right: 10px; padding: 5px;}' +
        '#vnu-step-navigation li.active {' +
                   'background-color: greenyellow }' +
        '</style>');

    var $body = $('body');
    var currentPath = window.location.pathname;
    var currentPath = currentPath.split('/');
    var currentStep = currentPath.pop();
    var currentFlow = currentPath.pop();
    var currentStepId;
    
    
    $body.prepend($style);
    
    var steps = {
        'vacature-plaatsen': [
            {
                name: 'inhoud',
                fields : {
                    nl_NL_title: 'Vacature title',
                    nl_NL_jobtitle_1: 'asbestsaneerders',
                    nl_NL_job_description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
                    location_country: '145',
                    location_zipcode: '2034CX'
                }
            },
            {
                name: 'criteria',
                fields : {
                    'job_category-100000': 'checkbox',
                    'job_industry-500000': 'checkbox',
                    education_level: '600007',
                    career_level: '800000'
                }
            },
            {
                name: 'contactgegevens',
                fields : {}
            },
            {
                name: 'preview',
                fields : {}
            },
            {
                name: 'bevestiging',
                fields : {}
            }
        ],
        'producten-afrekenen': [
            {
                name: 'overzicht',
                fields: {}
            },
            {
                name: 'factuurgegevens',
                fields: {
                    zipcode: '2034CX',
                    license_agreement_accepted: 'checkbox',
                    payment_method_invoice: 'checkbox'
                }
            },
            {
                name: 'controle',
                fields: {}
            },
            {
                name: 'bevestiging',
                fields: {}
            }
        ]
    };

    if (!steps[currentFlow]) return;

    steps = steps[currentFlow];

    var menuTemplate = $('<ul id="vnu-step-navigation">');
    
    menuTemplate.append('<li><a href="#" id="previous-step"><<</a></li>');   
    
    $.each(steps, function(index, step) {
        if (step.name == currentStep) {
            className = 'active';
            currentStepId = index;
        } else {
            var className = '';
        }
        menuTemplate.append('<li class="' + className + '"><a href="#" class="go-to-step" id="' + step.name + '">' + step.name + '</a></li>');
    });
    
    menuTemplate.append('<li><a href="#" id="next-step">>></a></li>');
    
	$body.prepend(menuTemplate);

    if (!steps[currentStepId]) return;

    var stepForm = steps[currentStepId]['fields']
    
    $.each(stepForm, function(name, value) {        
        //checkbox
        if (value == 'checkbox') {
            $input = $('#' + name);
            if ($input.length > 0) {
                $input.prop('checked', 'checked');
            }
        } else {
            $input = $('[name=' + name + ']');
            if ($input.length > 0 && !$input.val()) {
                $input.val(value);
                //Hack for RTF editor to update
                if ($input.hasClass('.rtf-editor')) {
                    setTimeout(function() {
                        $input.val(value);
                    }, 500);
                }
            }
        }
    });

    var $form = $('form.form');

    if ($form.find('.error').length > 0) {
        return false;
    }

    var setCookie = function(cname,cvalue) {
		document.cookie=cname+"="+cvalue+"; max-age=1000; path=/";
	}

    var getCookie = function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) 
          {
          var c = ca[i].trim();
          if (c.indexOf(name)==0) return c.substring(name.length,c.length);
          }
        return "";
    }

    var stopFlow = function() {
		document.cookie="nextStepId=; expires=-1; path=/;";
    }

    var nextStep = function() {
        var $nextButton = $('#submit_forward');
    
        if ($nextButton.length > 0) {
            $nextButton.click();    
        } else {
        	stopFlow();    
        }
    }
    
    var previousStep = function() {
        var $prevButton = $('#submit_backward');
    
        if ($prevButton.length > 0) {
            $prevButton.click();
        } else {
        	stopFlow();
        }
    }

    var goToStep = function(nextStepId) {
        if (!getCookie('nextStepId')) {
            setCookie('nextStepId', nextStepId);
        }
        
        if (currentStepId == nextStepId) {
            stopFlow();
        } else if (currentStepId < nextStepId) {
            nextStep();
        } else if (currentStepId > nextStepId) {
            previousStep();
        }
    }
    
    if (getCookie('nextStepId')) {
        goToStep(getCookie('nextStepId'));
    }
    
    $('#next-step').click(nextStep);
    $('#previous-step').click(previousStep);
    $('.go-to-step').click(function() {
        var nextStepName = $(this).attr('id');
        
        $.each(steps, function(index, step) {
            if (step.name == nextStepName) {
                goToStep(index);
            }
        });
    });

});