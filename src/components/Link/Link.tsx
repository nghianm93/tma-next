'use client';

import { useUtils, classNames } from '@telegram-apps/sdk-react';
import { type FC, type MouseEventHandler, type JSX, useCallback, useEffect } from 'react';
import { type LinkProps as NextLinkProps, default as NextLink } from 'next/link';
import { postEvent } from '@telegram-apps/bridge'; // Import on để lắng nghe sự kiện Back

import './styles.css';

export interface LinkProps extends NextLinkProps, Omit<JSX.IntrinsicElements['a'], 'href'> {}

export const Link: FC<LinkProps> = ({
                                        className,
                                        onClick: propsOnClick,
                                        href,
                                        ...rest
                                    }) => {
    const utils = useUtils();

    // Hàm xử lý khi nhấn vào Link
    const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>((e) => {
        propsOnClick?.(e);

        // Tính toán đường dẫn nếu là đường dẫn bên ngoài
        let path: string;
        if (typeof href === 'string') {
            path = href;
        } else {
            const { search = '', pathname = '', hash = '' } = href;
            path = `${pathname}?${search}#${hash}`;
        }

        const targetUrl = new URL(path, window.location.toString());
        const currentUrl = new URL(window.location.toString());
        const isExternal = targetUrl.protocol !== currentUrl.protocol
            || targetUrl.host !== currentUrl.host;

        if (isExternal) {
            e.preventDefault();
            utils && utils.openLink(targetUrl.toString());
        } else {
            // Hiển thị nút Back khi nhấn vào Link
            postEvent('web_app_setup_back_button', { is_visible: true });
        }
    }, [href, propsOnClick, utils]);




    return (
        <NextLink
            {...rest}
            href={href}
            onClick={onClick}
            className={classNames(className, 'link')}
        />
    );
};
