<?php
	$CONFIG = array(
		/* Mail Options */
		'mail_send_to'		=>	'maimairel@yahoo.com', 
		'mail_content_php'	=>	'mail-content.php', 
		
		/* Notification Messages */
		'form_errors_msg'	=>	'The following errors were encountered: <ul><li>%s</li></ul>', 
		'form_invalid_msg'	=>	'The form is invalid', 
		'form_success_msg'	=>	'Thank you, your message has been sent :)', 
		'mail_failed_msg'	=>	'An unknown error has occured', 

		/* Default Subject & Sender */
		'subject_default'	=> 'Website Contact Form', 
		'mail_default'		=> 'user@anonymous.com'
	);
	
	function createFormMessage( $formdata )
	{
		global $CONFIG;
		
		ob_start();
		
		extract($formdata);
		include $CONFIG['mail_content_php'];
		
		return ob_get_clean();
	}

	function validate( $formdata )
	{
		global $CONFIG;

		if( empty( $formdata ) )
		{
			return array('success'=>false, 'message'=>$CONFIG['form_invalid_msg']);
		}

		$errors = array();

		if( empty( $formdata['name'] ) )
		{
			$errors[] = 'Name is required';
		}

		if( empty( $formdata['email'] ) )
		{
			$errors[] = 'Email is required';
		}
		else
		{
			$emailPattern = '/^[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/';
			
			if( !preg_match($emailPattern, $formdata['email'] ) )
			{
				$errors[] = 'Email is invalid';
			}
		}

		if( empty( $formdata['subject'] ) )
		{
			$errors[] = 'Subject is required';
		}

		if( empty( $formdata['message'] ) )
		{
			$errors[] = 'Message is required';
		}

		return array( 'success'=>empty($errors), 'message'=>empty($errors)? $CONFIG['form_success_msg'] : sprintf($CONFIG['form_errors_msg'], implode('</li><li>', $errors )) );
	}
	
	
	/* Subscribe and Validation Logic */
	$formdata = $_POST['ContactForm'];
	$response = validate( $formdata );
	
	if( isset($response['success']) && $response['success'] )
	{
		include_once('swiftmail/swift_required.php');
		
		$transport = Swift_MailTransport::newInstance();
		$mailer = Swift_Mailer::newInstance($transport);
		
		$body = createFormMessage($formdata);
		
		$message = Swift_Message::newInstance();
		$message
			->setSubject(isset($formdata['subject'])? $formdata['subject'] : $CONFIG['subject_default'])
			->setFrom(isset($formdata['email'])? $formdata['email'] : $CONFIG['mail_default'])
			->setTo($CONFIG['mail_send_to'])
			->setBody($body, 'text/html');
			
		if( !$mailer->send($message) )
		{
			$response['success'] = false;
			$response['message'] = $CONFIG['mail_failed_msg'];
		}
	}
	
	echo json_encode($response);
?>