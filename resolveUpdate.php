<?php
	$fileName = "data.txt";
	$handle = fopen($fileName, "c+");
	$fileSize = filesize($fileName);
	if($fileSize > 0) {
		$text = fread($handle, $fileSize);
		ftruncate($handle, $filesize);
	}
	$array = json_decode($_POST["data"], true);
	foreach($array as $item) {
		var_dump($item);
		if($item["value"] == "Backspace") {
			$count = $item["end"] - $item["start"];
			if($count == 0)
				$text = substr_replace($text, "", $item["start"]-1, 1);
			else
				$text = substr_replace($text, "", $item["start"], $item["end"] - $item["start"]);
		}
		else {
			echo "value:" . $item["value"] . "start" . $item["start"];
			$text = substr_replace($text, $item["value"], $item["start"], 0);
		}
	}
	fwrite($handle, $text);
	fclose($handle);
	echo $text;
	
	