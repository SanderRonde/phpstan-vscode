<?php declare(strict_types = 1);

class HelloWorld
{
	public function blah(?int $ha): void
    {
        $this->world($ha);
    }
    public function world(int $ho): void
    {
    }
}