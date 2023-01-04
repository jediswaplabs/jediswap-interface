import React, {  } from 'react'
import {Form, Badge} from 'react-bootstrap';
import {useState} from 'react';

function Bridge() {
    const [fromUnit, setFromUnit] = useState('KM');
    const [toUnit, setToUnit] = useState('METER');
    const [value, setValue] = useState('');
    const [result, setResult] = useState('');
    const [currentConversion, setCurrentConversion] = useState('1');

    const onSelectChange = (event) => {
        console.log('event', event.target.value);
        const value = event.target.value;
        setCurrentConversion(value);
        setValue('');
        setResult('');
        if (event.target.value == '1') {
            setFromUnit('KM');
            setToUnit('M');
        }
        else if (value == '2') {
            setFromUnit('M');
            setToUnit('KM');
        }
        else if (value == '3') {
            setFromUnit('M/S');
            setToUnit('KM/H');
        }
        else if (value == '4') {
            setFromUnit('KM/H');
            setToUnit('M/S');
        }
        else if (value == '5') {
            setFromUnit('M');
            setToUnit('CM');
        }
        else if (value == '6') {
            setFromUnit('CM');
            setToUnit('M');
        }
    };

    const onValueChange = (event) => {
        setValue(event.target.value);
        if (event.target.value == '') {
            setResult('');
        }
        else {
            if (currentConversion == '1') {
                setResult(parseFloat(event.target.value) * 1000);
            }
            else if (currentConversion == '2') {
                setResult(parseFloat(event.target.value) * 0.001);
            }
            else if (currentConversion == '3') {
                setResult(parseFloat(event.target.value) * 3.6);
            }
            else if (currentConversion == '4') {
                setResult(parseFloat(event.target.value) * 0.277778);
            }
            else if (currentConversion == '5') {
                setResult(parseFloat(event.target.value) * 0.01);
            }
            else if (currentConversion == '6') {
                setResult(parseFloat(event.target.value) * 100);
            }
        }

    };

    const onResultChange = (event) => {
        setResult(event.target.value);
        if (event.target.value == '') {
            setValue('');
        }
        else {
            if (currentConversion == '1') {
                setValue(parseFloat(event.target.value) / 1000);
            }
            else if (currentConversion == '2') {
                setValue(parseFloat(event.target.value) / 0.001);
            }
            else if (currentConversion == '3') {
                setValue(parseFloat(event.target.value) / 3.6);
            }
            else if (currentConversion == '4') {
                setValue(parseFloat(event.target.value) / 0.277778);
            }
            else if (currentConversion == '5') {
                setValue(parseFloat(event.target.value) / 0.01);
            }
            else if (currentConversion == '5') {
                setValue(parseFloat(event.target.value) / 100);
            }
        }

    };

    return (
        <Form>
            <Form.Group className='mb-3' controlId='conversion'>
                <h1><Badge bg='info'>Converter</Badge></h1>
                <br />
                <h1>👇👇👇</h1>
                <br />
                <Form.Label><h4><b>Select Your Conversion</b></h4></Form.Label>
                <br />
                <Form.Select className='option' aria-label="Default select example" onChange={onSelectChange}>
                    <option value="1">KM - METER</option>
                    <option value="2">METER - KM</option>
                    <option value="3">KM/H - M/S</option>
                    <option value="4">M/S - KM/H</option>
                    <option value="5">CM - METER</option>
                    <option value="6">METER - CM</option>


                </Form.Select>
            </Form.Group>
            <br /><br />
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label><b>{fromUnit}</b></Form.Label>
                <input type="text" placeholder="Enter Value" value={value} onChange={onValueChange} />
            </Form.Group>
            <h1>👇👆</h1>
            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label><b>{toUnit}</b></Form.Label>
                <input type="text" placeholder="Result" value={result} onChange={onResultChange} />
            </Form.Group>
        </Form>
    );

}

export default Bridge;
