<?php
header('Content-Type: application/x-www-form-urlencoded');
header('Access-Control-Allow-Origin: *');

if (isset($_POST['zip'])) {
    $zip = filter_var($_POST['zip'], FILTER_VALIDATE_REGEXP, array('options'=>array('regexp'=>'/^[0-9]{5}/')));

    if ($zip) {
        $status = (int) $zip < 33333 ? array('zip' => $zip, 'state' => 'OH', 'city' => 'NEWTON FALLS') : array('zip' => $zip, 'state' => 'CA', 'city' => 'BEVERLY HILLS');
        echo json_encode($status);
    } else {
        echo 'error';
    }
} else {
    echo 'error';
}
