<?php

function bigintval($value) {
  $value = trim($value);
  if (ctype_digit($value)) {
    return $value;
  }
  $value = preg_replace("/[^0-9](.*)$/", '', $value);
  if (ctype_digit($value)) {
    return $value;
  }
  return 0;
}

	$fileName = "data.txt";
	$timeMilisec = floor(microtime(true)*1000);
	$timeSec = $timeMilisec * 1000;

	$handle = fopen($fileName, "c+");
	$fileSize = filesize($fileName);
	if($fileSize > 0) {
		$text = fread($handle, $fileSize);
		ftruncate($handle, 0);
		rewind($handle);
	}
	$array = json_decode($_POST["data"], true);
	foreach($array as $item) {
		//var_dump($item);
		if(isset($item["end"]))
			$count = $item["end"] - $item["start"];
		else
			$count = 0;
		if($item["value"] == "Backspace") {
			if($count == 0)
				$text = substr_replace($text, "", $item["start"]-1, 1);
			else
				$text = substr_replace($text, "", $item["start"], $count);
		}
		else {
			//echo "value:" . $item["value"] . "start" . $item["start"];
			$text = substr_replace($text, $item["value"], $item["start"], $count);
		}
	}

	fwrite($handle, $text);
	fclose($handle);
	
	if(file_exists($fileName.'.cache')) $cache = json_decode(file_get_contents($fileName.'.cache'), true);

	if($cache === null) $cache = array();

	$changes = array();
	$length = count($cache);
	$lastCheck = bigintval($_POST['last']);
	$minuteAgo = $timeMilisec - 60000;

	if($lastCheck < $minuteAgo) {
		$result['last'] = $lastCheck;
		$result['data'] = $text;
		$result['time'] = $timeMilisec;
		exit(json_encode($result));
	}

	if(is_array($cache)) {
	foreach ($cache as $val) {
		if($timeMilisec - $val['time'] > 60000)
			unset($val);
		else if($val['time'] > $lastCheck)
			array_push($changes, $val);
	}
	}

	$length = count($array);
	for($i = 0; $i < $length; $i++) {
		$object = $array[$i];
		$object['time'] = $timeMilisec;
		array_push($cache, $object);
	}

	file_put_contents($fileName.'.cache', json_encode(array_values($cache)));

	$result['data'] = $changes;
	$result['time'] = $timeMilisec;
	exit(json_encode($result));
		//echo "\nBEGIN\n";
	//echo $text;