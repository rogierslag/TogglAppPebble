<?php
$host ="https://toggl.com/api/v8/me";
$username = $_POST['username'];
$password = $_POST['password'];
$process = curl_init($host);
curl_setopt($process, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($process, CURLOPT_HEADER, 0);
curl_setopt($process, CURLOPT_USERPWD, $username . ":" . $password);
curl_setopt($process, CURLOPT_TIMEOUT, 30);
curl_setopt($process, CURLOPT_HTTPGET, 1);
curl_setopt($process, CURLOPT_RETURNTRANSFER, TRUE);
$return = curl_exec($process);
$info = curl_getinfo($process);

curl_close($process);
header('Content-type: application/json');
if($return == ""){
	$return = "{'username': ".$username."}";
}
echo $return;
