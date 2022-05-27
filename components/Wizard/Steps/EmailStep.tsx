import { CheckIcon } from '@heroicons/react/outline';
import axios from 'axios';
import { Field, Form, Formik, FormikErrors, FormikProps } from 'formik';
import { FC, useCallback, useRef, useState } from 'react'
import { useAuthDataUpdate } from '../../../context/auth';
import { useSwapDataState } from '../../../context/swap';
import { useWizardState } from '../../../context/wizard';
import LayerSwapAuthApiClient from '../../../lib/userAuthApiClient';
import { AuthConnectResponse } from '../../../Models/LayerSwapAuth';
import SubmitButton from '../../buttons/submitButton';

type EmailFormValues = {
    email?: string;
    confirm_right_wallet?: boolean;
    confirm_right_information?: boolean;
}


const UserLoginStep: FC = () => {
    const formikRef = useRef<FormikProps<EmailFormValues>>(null);
    const formValues = formikRef.current?.values;

    const [loading, setLoading] = useState(false)
    const { nextStep } = useWizardState();
    const swapData = useSwapDataState()

    const { updateEmail } = useAuthDataUpdate();

    const sendEmail = useCallback(async (values) => {
        setLoading(true)
        try {
            const apiClient = new LayerSwapAuthApiClient();
            const email = values.email
            const res = await apiClient.getCodeAsync(email)
            updateEmail(email)
            console.log(res)
            nextStep()
        }
        catch (e) {
            console.log(e)
            setLoading(false)
        }
    }, [formValues])

    function validateEmail(value) {
        let error;
        if (!value) {
            error = 'Required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
            error = 'Invalid email address';
        }
        return error;
    }
    function validateCheckbox(value) {
        let error;
        if (!value)
            error = 'Required';
        return error;
    }
    return (
        <>
            <Formik
                enableReinitialize={true}
                innerRef={formikRef}
                initialValues={{ confirm_right_information: false, confirm_right_wallet: false, email: "" }}
                validateOnMount={true}
                onSubmit={sendEmail}
                validate={(values) => {
                    let errors: FormikErrors<EmailFormValues> = {};
                    if (!values.confirm_right_information)
                        errors.confirm_right_information = 'Confirmation is required'
                    if (!values.confirm_right_wallet)
                        errors.confirm_right_wallet = 'Confirmation is required'
                }}
            >
                {({ values, setFieldValue, errors, isSubmitting, handleChange }) => (
                    <Form>
                        <div className="w-full px-3 md:px-6 md:px-12 py-12 grid grid-flow-row">
                            <p className='mb-12 md:mb-3.5 text-white mt-4 pt-2 text-xl leading-6 text-center md:text-left font-roboto'>We will send 6 digits code to your email for the verification.</p>
                            <div>
                                <label htmlFor="email" className="block font-normal text-light-blue text-sm">
                                    Email
                                </label>
                                <div className="relative rounded-md shadow-sm mt-1 mb-12 md:mb-11">
                                    <Field name="email" validate={validateEmail}>
                                        {({ field }) => (
                                            <input
                                                {...field}
                                                placeholder="Your email"
                                                autoCorrect="off"
                                                type="text"
                                                name="email"
                                                id="email"
                                                className="h-12 pb-1 pt-0 focus:ring-pink-primary focus:border-pink-primary border-darkblue-100 pr-36 block
                                        placeholder:text-light-blue placeholder:text-sm placeholder:font-normal placeholder:opacity-50 bg-darkblue-600 border-gray-600 w-full font-semibold rounded-md placeholder-gray-400"
                                            />
                                        )}
                                    </Field>

                                </div>
                                <div className="flex items-center md:mb-3 mb-5">
                                    <Field name="confirm_right_wallet" validate={validateCheckbox}>
                                        {({ field }) => (
                                            <input
                                                {...field}
                                                type="checkbox"
                                                name="confirm_right_wallet"
                                                id="confirm_right_wallet"
                                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                            />
                                        )}
                                    </Field>
                                    <label htmlFor="confirm_right_wallet" className="ml-3 block text-lg leading-6 text-light-blue cursor-pointer"> The provided address is your <span className='text-white'>{swapData.network?.name}</span> wallet address </label>
                                </div>
                                <div className="flex items-center mb-12 md:mb-11">
                                    <Field name="confirm_right_information" validate={validateCheckbox}>
                                        {({ field }) => (
                                            <input
                                                {...field}
                                                required={true}
                                                type="checkbox"
                                                name="confirm_right_information"
                                                id="confirm_right_information"
                                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                            />
                                        )}
                                    </Field>
                                    <label htmlFor="confirm_right_information" className="ml-3 block text-lg leading-6 text-light-blue cursor-pointer"> Providing wrong information will result in a loss of funds </label>
                                </div>
                            </div>
                            <div className="text-white text-sm mt-auto">
                                <SubmitButton isDisabled={loading || !!errors.email || !!errors.confirm_right_information || !!errors.confirm_right_wallet} icon="" isSubmitting={loading} onClick={() => { }}>
                                    Send
                                </SubmitButton>
                            </div>
                        </div>
                    </Form >
                )}
            </Formik >

        </>
    )
}

export default UserLoginStep;