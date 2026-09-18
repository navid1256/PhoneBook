<?php

namespace Tests\Backend\Unit;

use Tests\Backend\TestCase;
use MVC\PhoneBook\App\Utilities\Currency;
use MVC\PhoneBook\App\Utilities\Lang;

class UtilityTest extends TestCase
{
    public function testCurrencyFormat(): void
    {
        $this->assertSame('1,250.00 USD', Currency::format(1250));
        $this->assertSame('500.50 EUR', Currency::format(500.5, 'eur'));
    }

    public function testRialAndTomanConversion(): void
    {
        $this->assertSame(100.0, Currency::rialToToman(1000));
        $this->assertSame(1000.0, Currency::tomanToRial(100));
    }

    public function testPersianToLatinNumbers(): void
    {
        $persian = '۰۹۱۲۱۲۳۴۵۶۷';
        $latin = Lang::persianToLatinNum($persian);
        $this->assertSame('09121234567', $latin);
    }

    public function testLatinToPersianNumbers(): void
    {
        $latin = '09121234567';
        $persian = Lang::latinToPersianNum($latin);
        $this->assertSame('۰۹۱۲۱۲۳۴۵۶۷', $persian);
    }
}
