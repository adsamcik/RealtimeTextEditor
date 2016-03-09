<?php
	$fileName = "data.txt";
	$handle = fopen($fileName, "c+");
	$fileSize = filesize($fileName);
	if($fileSize > 0) {
		$text = fread($handle, $fileSize);
		ftruncate($handle, 0);
	}
	$array = json_decode($_POST["data"], true);
	foreach($array as $item) {
		var_dump($item);
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
			echo "value:" . $item["value"] . "start" . $item["start"];
			$text = substr_replace($text, $item["value"], $item["start"], $count);
		}
	}
	rewind($handle);
	fwrite($handle, $text);
	fclose($handle);
	echo "\nBEGIN\n";
	echo $text;