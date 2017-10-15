/**
 * Created by iamhosseindhv on 05/09/2017.
 */

$(document).ready(function(){
    var formurl = '/authenticate/create';

    $('.close-btn').click(function () {
        $('.base-layer').css('display', 'none');
    });


    $('.login-msg').click(function () {
        toggleToLogin();
        $('#errors, #email-errors, #password-errors, #passwordMatch-errors').empty();
        formurl = '/authenticate';

    });
    $('.signup-msg').click(function () {
        toggleToSignup();
        $('#errors, #email-errors, #password-errors, #passwordMatch-errors').empty();
        formurl = '/authenticate/create';
    });


    $("#my-form").submit(function(e) {
        //avoid executing the actual submit of the form.
        e.preventDefault();
        $('.submit-btn').prop('disabled', true);

        $.ajax({
            type: 'POST',
            url: formurl,
            data: $("#my-form").serialize(),
            success: function(data) { handleFormSuccess(data); },
            error: function (data) { handleFormFailure(data); }
        });
    });

});



function handleFormSuccess(data) {
    const errorsfield = $('#errors');
    const emailErrors = $('#email-errors');
    const passwordErrors = $('#password-errors');
    const passwordMatchErrors = $('#passwordMatch-errors');
    const emails = data.message.emails;
    const passwords = data.message.passwords;
    const passwordMatches = data.message.passwordMatches;
    [errorsfield, emailErrors, passwordErrors, passwordMatchErrors].forEach(function (div) {
       $(div).empty();
    });
    $(errorsfield)
        .append(data.success)
        .append(data.status);

    if (!data.isValidInputs){
        emails.forEach(function (err) {
            $(emailErrors).append('<li>' + err.description + '</li>');
        });
        passwords.forEach(function (err) {
            $(passwordErrors).append('<li>' + err.description + '</li>');
        });
        passwordMatches.forEach(function (err) {
            $(passwordMatchErrors).append('<v>' + err.description + '</v>');
        });
    } else {
        if (!data.no_err){
            emails.forEach(function (err) {
                $(emailErrors).append('<li>' + err.description + '</li>');
            });
            passwords.forEach(function (err) {
                $(passwordErrors).append('<li>' + err.description + '</li>');
            });
            passwordMatches.forEach(function (err) {
                $(passwordMatchErrors).append('<li>' + err.description + '</li>');
            });
        } else {
            $('.submit-btn').css('background-color', '#16b74f');
            const isLoginPage = $('.submit-btn').text() === 'Login';
            if (isLoginPage){
                //here you should redirect to referer url, (the url user has been redirected from), if any
                $('.base-layer').css('display', 'none');
                // location.reload();
                window.locatio  = '/';
            } else {
                //send verification email and user has to enter code to verify
            }
        }
    }
    $('.submit-btn').prop('disabled', false);   //enable button again
}



function handleFormFailure(data) {
    console.log('An error occurred.');
    console.log(data);
}



function toggleToLogin() {
    $('#passwordMatch').css('display', 'none');
    $('.login-wrapper h2').text('Login');
    $('.submit-btn').text('Login');
    $('.login-msg').hide();
    $('.signup-msg').show();
}



function toggleToSignup() {
    $('#passwordMatch').css('display', 'block');
    $('.login-wrapper h2').text('Sign up');
    $('.submit-btn').text('Sign up');
    $('.signup-msg').hide();
    $('.login-msg').show();
}
