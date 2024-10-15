<?php

class X {
	public string $y;
}

class DemoClass {
	/**
	 * @param 'a'|'b'|'c'|'d'|'e'|'f' $initialStr
	 */
	public function strUnion(string $initialStr): mixed {
		if ($initialStr === 'a') {
			return 0;
		}
		if ($initialStr === 'b' || $initialStr === 'c') {
			return $initialStr;
		}
		if ($initialStr === 'd') {
			return 1;
		}
		return $initialStr;
	}
}

