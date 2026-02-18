'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button } from './ui/button';
import { HelpCircle } from 'lucide-react';

export default function OnboardingTour({ tourId = "discuss" }) {
    const [driverObj, setDriverObj] = useState(null);

    const stepsConfig = {
        discuss: [
            {
                element: '#onboarding-back-btn',
                popover: {
                    title: 'Navigation',
                    description: 'Go back to your ideas list anytime. Your progress is auto-saved.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#onboarding-reply-toggle',
                popover: {
                    title: 'Adjust Complexity',
                    description: 'Toggle between "Visionary" (high-level strategy) and "Technical" (architecture & code) modes.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#onboarding-memory-btn',
                popover: {
                    title: 'Project Memory',
                    description: 'View all the key decisions, assumptions, and scope items we\'ve agreed upon so far.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#onboarding-mode-switcher',
                popover: {
                    title: 'Select Your Focus',
                    description: 'Switch AI modes to focus on Brainstorming, MVP Planning, Risk Analysis, and more.',
                    side: "top",
                    align: 'start'
                }
            },
            {
                element: '#onboarding-chat-input',
                popover: {
                    title: 'Collaborate',
                    description: 'Chat with your AI co-founder here. Ask questions, refine ideas, or request specific outputs.',
                    side: "top",
                    align: 'start'
                }
            }
        ],
        idea: [
            {
                element: '#onboarding-idea-input',
                popover: {
                    title: 'Your Vision',
                    description: 'Describe your app idea in plain English. No need for technical jargon yet.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#onboarding-reply-mode',
                popover: {
                    title: 'Choose Your Role',
                    description: 'Select "Visionary" if you want me to handle the tech, or "Technical" if you want to discuss architecture.',
                    side: "top",
                    align: 'start'
                }
            },
            {
                element: '#onboarding-continue-btn',
                popover: {
                    title: 'Start Building',
                    description: 'Click here to initialize your project and start brainstorming with your AI co-founder.',
                    side: "top",
                    align: 'start'
                }
            }
        ]
    };

    useEffect(() => {
        const componentDriver = driver({
            showProgress: true,
            animate: true,
            steps: stepsConfig[tourId] || []
        });

        setDriverObj(componentDriver);

        // Check if tour has been seen
        const hasSeenTour = localStorage.getItem(`has-seen-tour-${tourId}`);
        if (!hasSeenTour) {
            // Small delay to ensure elements are mounted
            setTimeout(() => {
                componentDriver.drive();
                localStorage.setItem(`has-seen-tour-${tourId}`, 'true');
            }, 1000);
        }
    }, [tourId]);

    const startTour = () => {
        if (driverObj) {
            driverObj.drive();
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={startTour}
            className="text-muted-foreground hover:text-primary transition-colors h-8 w-8 sm:h-10 sm:w-10"
            title="Start Tour"
        >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
    );
}
