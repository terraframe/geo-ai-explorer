export interface Style {
    color: string
    order: number
    label?: string
}

export interface StyleConfig { [key: string]: Style }
