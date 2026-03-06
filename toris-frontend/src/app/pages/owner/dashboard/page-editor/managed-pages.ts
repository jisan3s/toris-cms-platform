export type EditorFieldType = 'text' | 'textarea' | 'string-list' | 'object-list';

export interface ManagedObjectItemField {
    key: string;
    label: string;
    type?: 'text' | 'textarea';
    rows?: number;
    richText?: boolean;
}

export interface ManagedField {
    key: string;
    label: string;
    type: EditorFieldType;
    rows?: number;
    richText?: boolean;
    itemFields?: ManagedObjectItemField[];
    toFormValue?: (value: unknown) => unknown;
    toPayloadValue?: (value: unknown) => unknown;
}

export interface ManagedSection {
    key: string;
    label: string;
    defaultData: Record<string, unknown>;
    fields: ManagedField[];
}

export interface ManagedPage {
    key: string;
    label: string;
    sections: ManagedSection[];
}

const toFeaturesText = (value: unknown): unknown => {
    const items = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
    return items.map((item) => ({
        name: String(item?.['name'] || ''),
        price: String(item?.['price'] || ''),
        featuresText: Array.isArray(item?.['features']) ? (item['features'] as string[]).join('\n') : '',
        buttonText: String(item?.['buttonText'] || ''),
        buttonLink: String(item?.['buttonLink'] || '')
    }));
};

const toFeaturesArray = (value: unknown): unknown => {
    const items = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
    return items.map((item) => ({
        name: String(item?.['name'] || ''),
        price: String(item?.['price'] || ''),
        features: String(item?.['featuresText'] || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        buttonText: String(item?.['buttonText'] || ''),
        buttonLink: String(item?.['buttonLink'] || '')
    }));
};

export const managedNonCmsPages: ManagedPage[] = [
    {
        key: 'about',
        label: 'About',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            },
            {
                key: 'overview',
                label: 'Overview',
                defaultData: {},
                fields: [
                    { key: 'image', label: 'Image URL/Path', type: 'text' },
                    { key: 'title', label: 'Heading', type: 'text' },
                    { key: 'description1', label: 'Description 1', type: 'textarea', rows: 3, richText: true },
                    { key: 'description2', label: 'Description 2', type: 'textarea', rows: 3, richText: true }
                ]
            },
            {
                key: 'mission-vision',
                label: 'Mission & Vision',
                defaultData: {},
                fields: [
                    { key: 'missionTitle', label: 'Mission Title', type: 'text' },
                    { key: 'missionText', label: 'Mission Text', type: 'textarea', rows: 3, richText: true },
                    { key: 'visionTitle', label: 'Vision Title', type: 'text' },
                    { key: 'visionText', label: 'Vision Text', type: 'textarea', rows: 3, richText: true }
                ]
            },
            {
                key: 'why-choose',
                label: 'Why Choose',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Section Title', type: 'text' },
                    { key: 'cardText', label: 'Card Description', type: 'textarea', rows: 3, richText: true },
                    { key: 'items', label: 'Reasons', type: 'string-list' }
                ]
            },
            {
                key: 'stats',
                label: 'Stats',
                defaultData: {},
                fields: [
                    {
                        key: 'items',
                        label: 'Stat Items',
                        type: 'object-list',
                        itemFields: [
                            { key: 'title', label: 'Value' },
                            { key: 'label', label: 'Label' }
                        ]
                    }
                ]
            },
            {
                key: 'team-preview',
                label: 'Team Preview',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Heading', type: 'text' },
                    {
                        key: 'items',
                        label: 'Members',
                        type: 'object-list',
                        itemFields: [
                            { key: 'name', label: 'Name' },
                            { key: 'position', label: 'Position' },
                            { key: 'image', label: 'Image URL/Path' }
                        ]
                    }
                ]
            },
            {
                key: 'cta',
                label: 'CTA',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'buttonText', label: 'Button Text', type: 'text' },
                    { key: 'buttonLink', label: 'Button Link', type: 'text' }
                ]
            }
        ]
    },
    {
        key: 'contact',
        label: 'Contact',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            },
            {
                key: 'info',
                label: 'Contact Info',
                defaultData: {},
                fields: [
                    { key: 'addressTitle', label: 'Address Title', type: 'text' },
                    { key: 'address', label: 'Address', type: 'text' },
                    { key: 'emailTitle', label: 'Email Title', type: 'text' },
                    { key: 'email', label: 'Email', type: 'text' },
                    { key: 'phoneTitle', label: 'Phone Title', type: 'text' },
                    { key: 'phone', label: 'Phone', type: 'text' }
                ]
            },
            {
                key: 'cta',
                label: 'CTA',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'buttonText', label: 'Button Text', type: 'text' },
                    { key: 'buttonLink', label: 'Button Link', type: 'text' }
                ]
            }
        ]
    },
    {
        key: 'faq',
        label: 'FAQ',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            },
            {
                key: 'faqs',
                label: 'FAQ Items',
                defaultData: {},
                fields: [
                    {
                        key: 'items',
                        label: 'FAQ List',
                        type: 'object-list',
                        itemFields: [
                            { key: 'question', label: 'Question' },
                            { key: 'answer', label: 'Answer', type: 'textarea', rows: 3, richText: true }
                        ]
                    }
                ]
            },
            {
                key: 'cta',
                label: 'CTA',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2, richText: true },
                    { key: 'buttonText', label: 'Button Text', type: 'text' },
                    { key: 'buttonLink', label: 'Button Link', type: 'text' }
                ]
            }
        ]
    },
    {
        key: 'pricing',
        label: 'Pricing',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            },
            {
                key: 'plans',
                label: 'Plans',
                defaultData: {},
                fields: [
                    {
                        key: 'items',
                        label: 'Plan List',
                        type: 'object-list',
                        toFormValue: toFeaturesText,
                        toPayloadValue: toFeaturesArray,
                        itemFields: [
                            { key: 'name', label: 'Plan Name' },
                            { key: 'price', label: 'Price' },
                            { key: 'featuresText', label: 'Features (one per line)', type: 'textarea', rows: 4 },
                            { key: 'buttonText', label: 'Button Text' },
                            { key: 'buttonLink', label: 'Button Link' }
                        ]
                    }
                ]
            },
            {
                key: 'cta',
                label: 'CTA',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'buttonText', label: 'Button Text', type: 'text' },
                    { key: 'buttonLink', label: 'Button Link', type: 'text' }
                ]
            }
        ]
    },
    {
        key: 'services',
        label: 'Services',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            }
        ]
    },
    {
        key: 'testimonials',
        label: 'Testimonials',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            },
            {
                key: 'items',
                label: 'Items',
                defaultData: {},
                fields: [
                    {
                        key: 'items',
                        label: 'Testimonials',
                        type: 'object-list',
                        itemFields: [
                            { key: 'name', label: 'Name' },
                            { key: 'position', label: 'Position' },
                            { key: 'photo', label: 'Photo URL/Path' },
                            { key: 'message', label: 'Message', type: 'textarea', rows: 3, richText: true }
                        ]
                    }
                ]
            },
            {
                key: 'cta',
                label: 'CTA',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2, richText: true },
                    { key: 'buttonText', label: 'Button Text', type: 'text' },
                    { key: 'buttonLink', label: 'Button Link', type: 'text' }
                ]
            }
        ]
    },
    {
        key: 'blog',
        label: 'Blog',
        sections: [
            {
                key: 'page-banner',
                label: 'Page Banner',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            },
            {
                key: 'cta',
                label: 'CTA',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2, richText: true },
                    { key: 'buttonText', label: 'Button Text', type: 'text' },
                    { key: 'buttonLink', label: 'Button Link', type: 'text' }
                ]
            }
        ]
    },
    {
        key: 'portfolio',
        label: 'Portfolio',
        sections: [
            {
                key: 'hero',
                label: 'Hero',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            }
        ]
    },
    {
        key: 'team',
        label: 'Team',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            },
            {
                key: 'members',
                label: 'Members',
                defaultData: {},
                fields: [
                    {
                        key: 'items',
                        label: 'Members',
                        type: 'object-list',
                        itemFields: [
                            { key: 'name', label: 'Name' },
                            { key: 'role', label: 'Role' },
                            { key: 'image', label: 'Image URL/Path' }
                        ]
                    }
                ]
            },
            {
                key: 'cta',
                label: 'CTA',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2, richText: true },
                    { key: 'buttonText', label: 'Button Text', type: 'text' },
                    { key: 'buttonLink', label: 'Button Link', type: 'text' }
                ]
            }
        ]
    },
    {
        key: 'careers',
        label: 'Careers',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 }
                ]
            },
            {
                key: 'jobs',
                label: 'Jobs',
                defaultData: {},
                fields: [
                    {
                        key: 'items',
                        label: 'Job Openings',
                        type: 'object-list',
                        itemFields: [
                            { key: 'title', label: 'Job Title' },
                            { key: 'location', label: 'Location' },
                            { key: 'type', label: 'Type' },
                            { key: 'applyText', label: 'Apply Button Text' },
                            { key: 'applyLink', label: 'Apply Button Link' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        key: 'terms',
        label: 'Terms',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [{ key: 'title', label: 'Title', type: 'text' }]
            },
            {
                key: 'content',
                label: 'Content',
                defaultData: {},
                fields: [{ key: 'body', label: 'Body Text', type: 'textarea', rows: 10, richText: true }]
            }
        ]
    },
    {
        key: 'privacy',
        label: 'Privacy',
        sections: [
            {
                key: 'banner',
                label: 'Banner',
                defaultData: {},
                fields: [{ key: 'title', label: 'Title', type: 'text' }]
            },
            {
                key: 'content',
                label: 'Content',
                defaultData: {},
                fields: [{ key: 'body', label: 'Body Text', type: 'textarea', rows: 10, richText: true }]
            }
        ]
    },
    {
        key: 'global',
        label: 'Global',
        sections: [
            {
                key: 'header',
                label: 'Header',
                defaultData: {},
                fields: [
                    { key: 'brand', label: 'Brand Text', type: 'text' },
                    { key: 'logo', label: 'Brand Logo', type: 'text' },
                    { key: 'backgroundImage', label: 'Background Image', type: 'text' },
                    {
                        key: 'items',
                        label: 'Navigation Items',
                        type: 'object-list',
                        itemFields: [
                            { key: 'label', label: 'Label' },
                            { key: 'path', label: 'Path' }
                        ]
                    }
                ]
            },
            {
                key: 'footer',
                label: 'Footer',
                defaultData: {},
                fields: [
                    { key: 'title', label: 'Footer Title', type: 'text' },
                    { key: 'subtitle', label: 'Footer Subtitle', type: 'textarea', rows: 2 },
                    { key: 'logo', label: 'Footer Logo', type: 'text' },
                    { key: 'backgroundImage', label: 'Background Image', type: 'text' },
                    {
                        key: 'links',
                        label: 'Footer Links',
                        type: 'object-list',
                        itemFields: [
                            { key: 'label', label: 'Label' },
                            { key: 'path', label: 'Path' }
                        ]
                    },
                    { key: 'copyright', label: 'Copyright Text', type: 'text' }
                ]
            }
        ]
    }
];

export const managedNonCmsPageKeys = managedNonCmsPages.map((page) => page.key);

export const managedNonCmsPageMap = managedNonCmsPages.reduce<Record<string, ManagedPage>>((acc, page) => {
    acc[page.key] = page;
    return acc;
}, {});
